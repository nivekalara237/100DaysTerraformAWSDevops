import { Construct } from 'constructs'
import { aws_rds as rds, aws_secretsmanager } from 'aws-cdk-lib'
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  IVpc,
  Peer,
  Port,
  SecurityGroup,
  SubnetType
} from 'aws-cdk-lib/aws-ec2'
import { CustomProps } from '../stacks/custom.props'
import { StorageType } from 'aws-cdk-lib/aws-rds'
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager'

interface DatabaseProps extends CustomProps {
  vpc: IVpc,
  sg?: ISecurityGroup
}

export class Database extends Construct {

  private readonly _dbInstanceArn: string
  private readonly _passwordSecretArn: string
  private readonly _instanceEndpointUrl: string

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id)
    const secret: ISecret = new aws_secretsmanager.Secret(this, 'SecretResource', {
      secretName: 'database-instance-secret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: props.databaseUsername }),
        generateStringKey: 'password',
        excludeCharacters: '/@"`()[]\'',
        includeSpace: false
      }
    })

    const securityGroup = new SecurityGroup(this, 'DatabaseSecurityGroupeResource', {
      securityGroupName: 'sq-database-sg',
      disableInlineRules: false,
      allowAllOutbound: true,
      vpc: props.vpc,
      description: 'Database instance security group'
    })
    securityGroup.addIngressRule(
      Peer.securityGroupId(props.sg!.securityGroupId),
      Port.tcp(props.databasePort ?? 5432), 'Allow EC2 to connect to the database instance')

    const db = new rds.DatabaseInstance(this, 'DatabaseInstanceResource', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_16
      }),
      vpc: props.vpc,
      networkType: rds.NetworkType.IPV4,
      vpcSubnets: props.vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_WITH_EGRESS }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      publiclyAccessible: false,
      storageType: StorageType.GP3,
      credentials: rds.Credentials.fromSecret(secret, props.databaseUsername),
      allocatedStorage: 20,
      databaseName: props.databaseName,
      instanceIdentifier: 'sonarqube-db-1',
      port: props.databasePort ?? 5432,
      securityGroups: [
        securityGroup
      ]
    })

    this._dbInstanceArn = db.instanceArn
    this._passwordSecretArn = secret.secretArn
    this._instanceEndpointUrl = db.instanceEndpoint.socketAddress
  }

  get dbInstanceArn(): string {
    return this._dbInstanceArn
  }

  get passwordSecretArn() {
    return this._passwordSecretArn
  }

  get instanceEndpointUrl(): string {
    return this._instanceEndpointUrl
  }
}

/**
 const dbCluster = new rds.DatabaseCluster(this, 'DatabaseClusterAuroraResource', {
 credentials: rds.Credentials.fromSecret(secret, props.username ?? 'admin'),
 writer: rds.ClusterInstance.provisioned('writer', {
 publiclyAccessible: false,
 instanceType: InstanceType.of(
 InstanceClass.BURSTABLE3,
 InstanceSize.SMALL
 )
 }),
 readers: [rds.ClusterInstance.provisioned('reader', {
 publiclyAccessible: true
 })],
 engine: rds.DatabaseClusterEngine.auroraPostgres({
 version: rds.AuroraPostgresEngineVersion.VER_12_16
 }),
 vpcSubnets: {
 subnetType: SubnetType.PRIVATE_WITH_EGRESS
 },
 vpc: props.vpc,
 networkType: rds.NetworkType.IPV4
 })

 */