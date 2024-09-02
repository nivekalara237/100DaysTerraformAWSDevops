#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CoverageVisualizerStack } from '../stacks/coverage-visualizer.stack'

const app = new cdk.App()
new CoverageVisualizerStack(app, 'Day014MainStack', {
  domain: process.env.DOMAIN!,
  certificateArn: process.env.CERT_ARN!,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    Environment: 'DEV',
    Project: '100DaysIaCChallenge',
    IaCTools: 'CDK',
    Owner: 'kevin@nivekaa.com',
    Days: '013'
  },
  stackName: 'Day014-Test-Coverage-Visualizer'
})