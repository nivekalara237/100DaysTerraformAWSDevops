#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../stacks/cdk-stack'
import { WebsiteStack } from '../stacks/website-stack'

const app = new cdk.App()
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

const websiteStack = new WebsiteStack(app, 'Day010WebsiteBucketStack', {
  env,
  bucketName: `angular-app-website-e5921cb0-51a0-11ef-8075-12aa97d84d77`
})


const cdkstack = new CdkStack(app, 'Day010CdkStack', {
  env,
  stage: process.env.STAGE_NAME ?? 'dev',
  tableName: 'TotoListAppTables',
  domain: 'nivekaa.com',
  cognito: {
    verificationFromEmail: 'kevin.k@nivekaa.com'
  },
  route53: {
    apigw: {
      subdomain: 'todo-api.nivekaa.com',
      certificateArn: process.env.CERTIFICATE_ARN
    }
  }
})

app.synth()