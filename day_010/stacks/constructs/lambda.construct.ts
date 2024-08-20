import * as cdk from 'constructs'
import { Construct } from 'constructs'
import { Aws, aws_apigateway, aws_iam as iam, aws_lambda as lambda, Duration, StackProps } from 'aws-cdk-lib'
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs'
import { generateResourceID } from './utils'

interface Props {
  entryFunction: string;
  functionName: string;
  env?: Record<string, string>;
  layersArns?: string[];
  externalDeps?: string[];
  logged?: boolean;
  memory?: number;
  role?: {
    name?: string,
    inlinePolicies?: Record<string, iam.PolicyDocument>
  };
}

export class LambdaFunction extends cdk.Construct {
  private readonly _functionArn: string
  private readonly _resource: NodejsFunction

  constructor(scope: Construct, id: string, private param: Props) {
    super(scope, id)

    const policies: Record<string, iam.PolicyDocument> = param.role?.inlinePolicies ?? {}
    if (param.logged) {
      policies['logging'] = new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            actions: [
              'logs:CreateLogGroup',
              'logs:PutLogEvents',
              'logs:CreateLogStream'
            ],
            effect: iam.Effect.ALLOW,
            resources: ['*']
          })
        ]
      })
    }
    const lamnbdaRole = this.createLambdaRole(
      param.role?.name ?? `Role${generateResourceID()}`,
      param,
      policies
    )

    const func = new NodejsFunction(this, `Lambda${generateResourceID()}Resource`, {
      entry: param.entryFunction,
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      functionName: param.functionName,
      environment: param.env,
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: param.memory ?? 128,
      role: lamnbdaRole,
      bundling: {
        externalModules: [
          ...(param.externalDeps || []),
          'utils'
        ],
        sourceMap: true,
        sourceMapMode: SourceMapMode.BOTH
      },
      layers: [
        ...((param.layersArns || [])
          .filter(value => !!value && value.length)
          .map(value => lambda.LayerVersion.fromLayerVersionArn(this, `LayerVersion${generateResourceID()}Resource`, value)))
      ]
    })

    this._functionArn = func.functionArn
    this._resource = func
  }

  get functionArn() {
    return this._functionArn
  }

  get resource() {
    return this._resource
  }

  grantApi = (restApi: aws_apigateway.RestApi) => {
    this._resource.addPermission(`TodoAppLambdaPermissionResource_${generateResourceID()}`, {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceAccount: restApi.env?.account,
      sourceArn: `arn:${Aws.PARTITION}:execute-api:${restApi.env?.region}:${restApi.env?.account}:${restApi.restApiId}/*/*/*`
    })
  }

  private createLambdaRole(roleName: string, props: StackProps, inlinePolicies?: Record<string, iam.PolicyDocument>): iam.Role {
    return new iam.Role(this, `${roleName}Resource`, {
      roleName: roleName,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com', {
        region: props.env?.region
      }),
      path: '/',
      inlinePolicies: {
        ...inlinePolicies
      }
    })
  }
}