#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../stacks/cdk-stack'
import { WebsiteStack } from '../stacks/website-stack'
import { DeveloperToolsStack } from '../stacks/developer-tools.stack'

const app = new cdk.App()
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}
const MAIN_DOMAIN = process.env.MAIN_DOMAIN
const bucketName = `angular-app-website-e5921cb0-51a0-11ef-8075-12aa97d84d77`
const webAppDomain = `todo-webapp.${MAIN_DOMAIN}`

const devtoolsStack = new DeveloperToolsStack(app, 'Day012DevToolsStack', {
  env,
  git: {
    repositoryName: '100DaysTerraformAWSDevops',
    branchRef: 'master',
    owner: 'nivekalara237',
    accessTokenSecretArn: process.env.PERSONAL_ACCESS_SECRET_ARN
  },
  build: {
    todoAppBucketName: bucketName
  }
})

const websiteStack = new WebsiteStack(app, 'Day011WebsiteBucketStack', {
  env,
  bucketName,
  origins: ['https://'.concat(webAppDomain)]
})

const cdkstack = new CdkStack(app, 'Day011CdkStack', {
  env,
  stage: process.env.STAGE_NAME ?? 'dev',
  tableName: 'TotoListAppTables',
  domain: `${MAIN_DOMAIN}`,
  websiteBucketName: bucketName,
  cognito: {
    verificationFromEmail: `validation@${MAIN_DOMAIN}`
  },
  distribution: {
    domainName: webAppDomain
  },
  acm: {
    certificateArn: process.env.CERTIFICATE_ARN!
  },
  route53: {
    apigw: {
      subdomain: `todo-api.${MAIN_DOMAIN}`
    }
  }
})

app.synth()