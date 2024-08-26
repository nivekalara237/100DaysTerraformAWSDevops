import {
  aws_iam as iam,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  Duration,
  RemovalPolicy,
  StackProps
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStack } from './base.stack'

export interface WebsiteStackProps extends StackProps {
  bucketName: string,
  origins?: string[]
}

export class WebsiteStack extends BaseStack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props)

    const wsBucket = new s3.Bucket(this, 'WebsiteBucketResource', {
      bucketName: props.bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      eventBridgeEnabled: false,
      websiteIndexDocument: 'index.csr.html',
      websiteErrorDocument: 'index.csr.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS
    })

    wsBucket.grantRead(new iam.StarPrincipal(), '*')

    wsBucket.addCorsRule({
      allowedMethods: [
        s3.HttpMethods.GET,
        s3.HttpMethods.HEAD,
        s3.HttpMethods.DELETE,
        s3.HttpMethods.PUT,
        s3.HttpMethods.POST
      ],
      allowedOrigins: (props.origins ?? ['*']).filter(value => !!value && value.trim().length > 0),
      maxAge: Duration.minutes(10).toSeconds(),
      allowedHeaders: ['*']
      // exposedHeaders: ['*']
    })

    new s3deploy.BucketDeployment(this, 'DeployTodoApp', {
      destinationBucket: wsBucket,
      sources: [
        s3deploy.Source.asset('../apps/todo-app/dist/todo-app/browser', {
          exclude: ['node_modules']
        })
      ]
    })
  }
}