#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { SonarServerInfrastructureStack } from '../stacks/sonar-server-infrastructure.stack'

const app = new cdk.App()
new SonarServerInfrastructureStack(app, 'Day015Stack', {
  cidr: '10.0.0.1/16',
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
})
app.synth()