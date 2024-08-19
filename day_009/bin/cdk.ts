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

const websiteStack = new WebsiteStack(app, 'Day009WebsiteBucketStack', {
  env,
  bucketName: `angular-app-website-e5921cb0-51a0-11ef-8075-12aa97d84d77`
})


const cdkstack = new CdkStack(app, 'Day009CdkStack', {
  env,
  stage: process.env.STAGE_NAME ?? 'dev',
  tableName: 'TotoListAppTables',
  cognito: {
    domain: 'nivekaa.com',
    verificationFromEmail: 'kevinlactiokemta@gmail.com'
  }
})

app.synth()