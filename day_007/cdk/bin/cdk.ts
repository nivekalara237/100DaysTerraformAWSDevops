#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../lib/cdk-stack'
import { LayerStack } from '../lib/layer-stack'

const app = new cdk.App()
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}
const layerName = 'NodeModulesAndUtilsLayer'
const layerStack = new LayerStack(app, 'Day007LambdaLayerStack', {
  env,
  layerName
})

// layerStack.node.findChild('LayerResource')

const cdkstack = new CdkStack(app, 'Day007CdkStack', {
  env,
  stage: process.env.STAGE_NAME + '',
  tableName: 'TotoListAppTables'
})

cdkstack.addDependency(layerStack, 'The LayerStack need to be created before CdkStack')

app.synth()