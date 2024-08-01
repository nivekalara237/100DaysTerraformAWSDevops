import { aws_lambda as lambda, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface LayerStackProps extends StackProps {
  layerName: string
}

export class LayerStack extends Stack {
  public readonly layerArn: string

  constructor(scope: Construct, id: string, props?: LayerStackProps) {
    super(scope, id, props)
    const layer = new lambda.LayerVersion(this, 'LayerResource', {
      code: lambda.Code.fromAsset('./apps/layer'),
      compatibleArchitectures: [lambda.Architecture.X86_64],
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_18_X],
      layerVersionName: props?.layerName,
      removalPolicy: RemovalPolicy.DESTROY
    })

    this.layerArn = layer.layerVersionArn

    this.exportValue(layer.layerVersionArn, {
      name: 'layerArn',
      description: 'The Lambda Layer Version ARN Value to be use by others stack as need'
    })
  }
}