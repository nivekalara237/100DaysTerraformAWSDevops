#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../stacks/cdk-stack'
import { LayerStack } from '../stacks/layer-stack'
import { WebsiteStack } from '../stacks/website-stack'

const app = new cdk.App()
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}
const layerName = 'NodeModulesAndUtilsLayer'
const layerStack = new LayerStack(app, 'Day008LambdaLayerStack', {
  env,
  layerName
})

const websiteStack = new WebsiteStack(app, 'Day008WebsiteBucketStack', {
  env,
  bucketName: `angular-app-website-e5921cb0-51a0-11ef-8075-12aa97d84d77`
})

// layerStack.node.findChild('LayerResource')

const cdkstack = new CdkStack(app, 'Day008CdkStack', {
  env,
  stage: process.env.STAGE_NAME + '',
  tableName: 'TotoListAppTables'
})

cdkstack.addDependency(layerStack, 'The LayerStack need to be created before CdkStack')

app.synth()