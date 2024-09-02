import {
  aws_codebuild as codebuild,
  aws_iam as iam,
  aws_logs as logs,
  aws_secretsmanager as secrets,
  RemovalPolicy,
  StackProps
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStack } from './base.stack'
import { LambdaFunction } from './constructs/lambda.construct'

interface DeveloperToolsProps extends StackProps {
  git: {
    repositoryName: string,
    owner: string,
    branchRef?: string,
    accessTokenSecretArn?: string
  },
  build: {
    todoAppBucketName: string
  }
}

export class DeveloperToolsStack extends BaseStack {

  constructor(scope: Construct, id: string, props: DeveloperToolsProps) {
    super(scope, id, props)

    const secret = secrets.Secret.fromSecretAttributes(this, 'Secrets-Codebuild-Github-Personal-Access', {
      secretCompleteArn: props.git.accessTokenSecretArn
    })

    new codebuild.GitHubSourceCredentials(this, 'GitHubSourceCredentials', {
      accessToken: secret.secretValueFromJson('github')
    })

    const cloudwatch = new logs.LogGroup(this, 'CodeBuildLogGroup', {
      logGroupName: 'CodeBuildLogGroup',
      retention: logs.RetentionDays.ONE_DAY,
      logGroupClass: logs.LogGroupClass.STANDARD,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const emptyBucketLambda = new LambdaFunction(this, 'EmptyBucketFunction', {
      entryFunction: './apps/functions/todo-app/empty-bucket.function.ts',
      functionName: 'Empty-Bucket-Function',
      env: {
        REGION: props.env?.region!
      },
      role: {
        name: 'EmptyBucketFunctionRole',
        inlinePolicies: {
          s3: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  's3:GetBucket',
                  's3:GetObject',
                  's3:ListObjects',
                  's3:DeleteObject'
                ],
                resources: [
                  `arn:aws:s3:::${props.build.todoAppBucketName}`,
                  `arn:aws:s3:::${props.build.todoAppBucketName}/*`
                ]
              })
            ]
          })
        }
      },
      logged: true
    })

    emptyBucketLambda.resource.applyRemovalPolicy(RemovalPolicy.DESTROY)

    const todoBuildProject = new codebuild.Project(this, 'CodeBuild', {
      projectName: 'TodoAppCodeBuildProject',
      buildSpec: this.buildSpec(),
      logging: {
        cloudWatch: {
          logGroup: cloudwatch,
          enabled: true
        }
      },
      source: codebuild.Source.gitHub({
        repo: props.git.repositoryName,
        reportBuildStatus: true,
        owner: props.git.owner,
        webhook: true,
        webhookTriggersBatchBuild: true,
        webhookFilters: [
          codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH, codebuild.EventAction.PULL_REQUEST_MERGED)
            .andBranchIs(props.git.branchRef ?? 'master')
            .andFilePathIs('apps')
        ]
      }),
      visibility: codebuild.ProjectVisibility.PUBLIC_READ,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        computeType: codebuild.ComputeType.SMALL,
        privileged: true
      },
      environmentVariables: {
        BUCKET_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.build.todoAppBucketName
        },
        EMPTY_BUCKET_FUNCTION_ARN: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: emptyBucketLambda.functionArn
        }
      },
      badge: true,
      role: new iam.Role(this, 'BuildCodeRole', {
        path: '/',
        assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com', {
          region: props.env?.region
        }),
        inlinePolicies: {
          logging: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'logs:CreateLogGroup',
                  'logs:PutLogEvents',
                  'logs:CreateLogStream'
                ],
                resources: [cloudwatch.logGroupArn]
              })
            ]
          }),
          s3: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:PutObject'],
                resources: [
                  `arn:aws:s3:::${props.build.todoAppBucketName}`,
                  `arn:aws:s3:::${props.build.todoAppBucketName}/*`
                ]
              })
            ]
          }),
          secrets: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [props.git.accessTokenSecretArn!],
                actions: ['secretsmanager:GetSecretValue']
              })
            ]
          }),
          lambda_function: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'lambda:InvokeFunction'
                ],
                resources: [emptyBucketLambda.functionArn]
              })
            ]
          })
        }
      })
    })

    emptyBucketLambda.grantInvoke({
      grantPrincipal: new iam.ServicePrincipal('codebuild.amazonaws.com')
    }, todoBuildProject.projectArn, props.env?.account)
  }

  buildSpec = (): codebuild.BuildSpec => {
    return codebuild.BuildSpec.fromObjectToYaml({
      version: '0.2',
      env: {
        shell: 'bash'
      },
      phases: {
        pre_build: {
          commands: [
            'echo Build started on `date`',
            'npm install -g @angular/cli',
            'cd apps/todo-app && npm install'
          ]
        },

        build: {
          commands: [
            'ng build --configuration production',
            `aws lambda invoke --function-name \${EMPTY_BUCKET_FUNCTION_ARN} --cli-binary-format raw-in-base64-out --payload '{ "payload": {"bucketName": "\${BUCKET_NAME}"} }' response.json`,
            'aws s3 cp dist/todo-app/browser s3://${BUCKET_NAME}/ --recursive'
          ]
        }
      },
      artifacts: {
        files: ['**/*']
      },
      cache: {
        paths: ['node_modules/**/*', 'dist/**']
      }
    })
  }
}