import * as cdk from 'aws-cdk-lib'
import { aws_dynamodb as db, aws_iam as iam, aws_lambda as lambda, aws_s3 as s3, Duration, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LogLevel, NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'

export interface CustomStackProps extends cdk.StackProps {
  picturesBucketName: string,
  thumbnailsBucketName: string,
  pictureTableName: string,
  thumbnailTableName: string,
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, props)
    // const {pictureTable, thumbnailTable} =
    this.createTables(props)
    const lambdaRole: iam.Role = this.createLambdaRole(props)
    const func = this.createLambdaFunction(lambdaRole, props)
    Tags.of(func).add('Name', `lambda:ProcessionImageFunction`)

    const permission = this.createLambdaPermission(func, props)
    const cfnFunctionResource = func.node.findChild('Resource') as lambda.CfnFunction

    const pictureBucket = this.createBuckets(func, props)
    pictureBucket?.addDependency(permission)
    pictureBucket?.addDependency(cfnFunctionResource)

  }

  private createBuckets = (func: lambda.Function, props: CustomStackProps) => {
    const buckets = [
      {
        id: 'PicturesBucketResource',
        name: props.picturesBucketName
      },
      {
        id: 'ThumbnailsBucketResource',
        name: props.thumbnailsBucketName
      }].map(value => {
      const eventTrigger = value.name === props.picturesBucketName
        ? {
          lambdaConfigurations: [
            {
              event: 's3:ObjectCreated:*',
              function: func.functionArn
            }
          ]
        } : undefined
      return new s3.CfnBucket(this, value.id, {
        bucketName: value.name,
        publicAccessBlockConfiguration: {
          ignorePublicAcls: true,
          blockPublicAcls: true,
          blockPublicPolicy: true,
          restrictPublicBuckets: true
        },
        objectLockEnabled: false,
        notificationConfiguration: eventTrigger,
        tags: [
          {
            key: 'Name',
            value: `s3:bucket:${value.name}`
          }
        ]
      })
    })

    return buckets.find(value => value.bucketName === props.picturesBucketName)
  }

  private createLambdaFunction = (role: iam.Role, props: CustomStackProps) => {
    return new NodejsFunction(this, 'zeLambdaFunction', {
      functionName: 'ProcessingImageFunction',
      role: role,
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(10),
      memorySize: 512,
      // code: Code.fromAsset(""),
      bundling: {
        minify: false,
        format: OutputFormat.CJS,
        // commandHooks: ,
        logLevel: LogLevel.VERBOSE
      },
      entry: './assets/lambda/index.ts',
      environment: {
        REGION: props.env?.region || 'us-east-1',
        TRIGGER_BUCKET_NAME: props.picturesBucketName,
        THUMBS_BUCKET_NAME: props.thumbnailsBucketName,
        DYNAMODB_THUMBNAILS_PICTURES_TABLE_NAME: props.thumbnailTableName,
        DYNAMODB_PICTURES_TABLE_NAME: props.pictureTableName
      },
      allowPublicSubnet: false
    })

  }

  private createTables = (props: CustomStackProps) => {
    const tables = [props.pictureTableName, props.thumbnailTableName]
      .map(tbName => {
        return new db.CfnTable(this, `DynamoDBTable-${tbName}`, {
          tableName: tbName,
          billingMode: 'PAY_PER_REQUEST',
          tableClass: 'STANDARD',
          keySchema: [{
            keyType: 'HASH',
            attributeName: 'ID'
          }, {
            keyType: 'RANGE',
            attributeName: 'ObjectKey'
          }],
          attributeDefinitions: [{
            attributeName: 'ID',
            attributeType: 'S'
          }, {
            attributeName: 'ObjectKey',
            attributeType: 'S'
          }],
          tags: [
            {
              key: 'Name',
              value: `dynamodb:${tbName}`
            }
          ]
        })
      })
    return {
      pictureTable: tables[0],
      thumbnailTable: tables[1]
    }
  }

  private createLambdaRole = (props: CustomStackProps) => {
    return new iam.Role(this, 'LambdaExecRole', {
      roleName: 's3-lambda-execution-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com', {
        region: props.env?.region
      }),
      path: '/',
      inlinePolicies: {
        logging: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogSteam',
                'logs:PutLogEvents'
              ],
              resources: ['*']
            })
          ]
        }),
        putItemDynamoDB: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:PutItem'
              ],
              resources: [
                `arn:aws:dynamodb:${props.env?.region}:${props.env?.account}:table/${props.pictureTableName}`,
                `arn:aws:dynamodb:${props.env?.region}:${props.env?.account}:table/${props.thumbnailTableName}`
              ]
            })
          ]
        }),
        s3Bucket: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:PutObject'
              ],
              resources: [
                `arn:aws:s3:::${props.thumbnailsBucketName}`,
                `arn:aws:s3:::${props.thumbnailsBucketName}/*`
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:GetObjectAcl'
              ],
              resources: [
                `arn:aws:s3:::${props.picturesBucketName}`,
                `arn:aws:s3:::${props.picturesBucketName}/*`
              ]
            })
          ]
        })
      }
    })
  }

  private createLambdaPermission = (func: NodejsFunction, props: CustomStackProps) => {
    return new lambda.CfnPermission(this, 'LambdaPermission', {
      functionName: func.functionArn,
      sourceArn: `arn:aws:s3:::${props.picturesBucketName}`,
      action: 'lambda:InvokeFunction',
      principal: 's3.amazonaws.com',
      sourceAccount: props.env?.account
    })
  }
}
