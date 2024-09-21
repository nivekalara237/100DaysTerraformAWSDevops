import { Construct } from 'constructs'
import { aws_rds } from 'aws-cdk-lib'
import { IVpc } from 'aws-cdk-lib/aws-ec2'
import { CustomProps } from '../stacks/custom.props'

interface DatabaseProps extends CustomProps {
  vpc: IVpc
}

export class Database extends Construct {
  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id)

    const rds = new aws_rds.DatabaseInstance(this, '', {
      databaseName: 'sonar-pg-db',
      vpc: props.vpc,
      engine: null!
    })
  }
}