import { Construct } from 'constructs'
import { CustomStackProps } from '../custom-stack.props'

export class AuthConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id)
  }
}