import * as cdk from 'aws-cdk-lib'

export interface CustomStackProps extends cdk.StackProps {
  stage: 'dev' | 'prod' | 'staging' | string,
  tableName: string,
  domain?: string,
  websiteBucketName?: string,
  distribution?: {
    domainName?: string
  }
  acm?: {
    certificateArn: string,
  }
  route53?: {
    apigw?: {
      subdomain?: string
    }
  }
  cognito?: {
    domain?: string,
    verificationFromEmail?: string,
  }
}