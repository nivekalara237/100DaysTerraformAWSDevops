import { Construct } from 'constructs'
import { aws_apigateway as api } from 'aws-cdk-lib'

export interface MethodProps {
  path: string;
  parentID: string;
}

export interface CustomProps {
  resourceChain: any
}

export class ApiResourceResource extends Construct {

  private readonly resource: api.CfnMethod

  constructor(scope: Construct, id: string, props: MethodProps) {
    super(scope, id)
  }
}