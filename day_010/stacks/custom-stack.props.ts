import * as cdk from 'aws-cdk-lib'

export interface CustomStackProps extends cdk.StackProps {
  stage: 'dev' | 'prod' | 'staging' | string,
  tableName: string,
  domain?: string,
  route53?: {
    apigw?: {
      certificateArn?: string,
      subdomain?: string
    }
  }
  cognito?: {
    domain?: string,
    verificationFromEmail?: string,
  }
}