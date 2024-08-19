import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface LayerStackProps extends StackProps {
  layerName: string
}

export class LayerStack extends Stack {
  public readonly layerArn: string

  constructor(scope: Construct, id: string, props?: LayerStackProps) {
    super(scope, id, props)

  }
}