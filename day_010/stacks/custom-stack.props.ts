import * as cdk from 'aws-cdk-lib'

export interface CustomStackProps extends cdk.StackProps {
  stage: 'dev' | 'prod' | 'staging' | string,
  tableName: string,
  cognito?: {
    domain?: string,
    verificationFromEmail?: string,
  }
}