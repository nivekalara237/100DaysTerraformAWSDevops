import * as cdk from 'aws-cdk-lib'
import { aws_iam, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { S3Website } from '../lib/constructs/s3-website.construnct'
import { WebsiteDistribution } from '../lib/constructs/website-distribution.construct'
import { Effect } from 'aws-cdk-lib/aws-iam'

interface CustomProps extends cdk.StackProps {
  domain: string
  certificateArn: string
}

export class CoverageVisualizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomProps) {
    super(scope, id, props)

    const bucket = new S3Website(this, 'Coverage-Visualizer-Bucket', {
      origins: [`https://visualizer.${props.domain}`]
    })

    const distribution = new WebsiteDistribution(this, 'CloudFront', {
      mainDomain: props.domain,
      websiteBucketName: bucket.bucket.bucketName,
      distribution: {
        subDomain: `visualizer.${props.domain}`
      },
      acm: {
        certificateArn: props.certificateArn
      }
    })

    const cloudFrontPolicy = new aws_iam.Policy(this, 'S3PolicyForCloudFront', {
      roles: [
        new aws_iam.Role(this, 'S3PolicyRoleForCloudFront', {
          assumedBy: new aws_iam.ServicePrincipal('s3.amazonaws.com'),
          path: '/',
          inlinePolicies: {
            s3: new aws_iam.PolicyDocument({
              assignSids: true,
              statements: [
                new aws_iam.PolicyStatement({
                  effect: Effect.ALLOW,
                  actions: ['s3:GetObject'],
                  resources: [bucket.bucket.bucketArn + '/*'],
                  conditions: {
                    Bool: { 'AWS:SecureTransport': true },
                    StringEquals: { 'AWS:SourceArn': distribution.distributionArn }
                  }
                })
              ]
            })
          }
        })
      ]
    })

    const user = new aws_iam.User(this, 'S3Uploader', {
      userName: 'S3-Uploader',
      passwordResetRequired: false
    })

    user.addToPolicy(new aws_iam.PolicyStatement({
      actions: [
        's3:PutObject',
        's3:PutObjectAcl'
      ],
      effect: Effect.ALLOW,
      resources: [bucket.bucket.bucketArn + '/' + bucket.baseSegment + '/*']
    }))

    new CfnOutput(this, 'cloudfront_url', {
      value: distribution.distributionUrl
    })

    new CfnOutput(this, 's3website_url', {
      value: bucket.bucket.bucketWebsiteUrl
    })
  }
}
