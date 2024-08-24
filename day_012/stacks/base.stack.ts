import { Stack, StackProps, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class BaseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    Tags.of(this).add('AppManagerCFNStackKey', id)
  }
}