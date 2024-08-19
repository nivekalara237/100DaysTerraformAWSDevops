import { aws_iam as iam, aws_s3 as s3, Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HttpMethods } from 'aws-cdk-lib/aws-s3'
import { BaseStack } from './base.stack'

export interface WebsiteStackProps extends StackProps {
  bucketName: string
}

export class WebsiteStack extends BaseStack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props)

    const wsBucket = new s3.Bucket(this, 'WebsiteBucketResource', {
      bucketName: props.bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
      eventBridgeEnabled: false,
      websiteIndexDocument: 'index.csr.html',
      websiteErrorDocument: 'index.csr.html',
      // accessControl: s3.BucketAccessControl.PUBLIC_READ
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS
    })

    wsBucket.grantRead(new iam.StarPrincipal(), '*')

    wsBucket.addCorsRule({
      allowedMethods: [
        s3.HttpMethods.GET,
        HttpMethods.HEAD, HttpMethods.DELETE,
        HttpMethods.PUT, HttpMethods.POST
      ],
      allowedOrigins: ['*'],
      maxAge: Duration.minutes(30).toSeconds()
    })
  }
}