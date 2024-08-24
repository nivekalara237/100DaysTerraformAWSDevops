import { Construct } from 'constructs'
import { aws_lambda as lambda, RemovalPolicy, StackProps } from 'aws-cdk-lib'

interface LayerProps extends StackProps {
  layerName: string
}

export class LambdaLayer extends Construct {
  private readonly _layerArn: string

  constructor(scope: Construct, id: string, props: LayerProps) {
    super(scope, id)

    const layer = new lambda.LayerVersion(this, 'LayerResource', {
      code: lambda.Code.fromAsset('./apps/layer'),
      compatibleArchitectures: [lambda.Architecture.X86_64],
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_18_X],
      layerVersionName: props?.layerName,
      removalPolicy: RemovalPolicy.DESTROY
    })

    this._layerArn = layer.layerVersionArn
  }

  get layerArn() {
    return this._layerArn
  }
}