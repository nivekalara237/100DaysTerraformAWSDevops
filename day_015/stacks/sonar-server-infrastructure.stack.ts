import * as cdk from 'aws-cdk-lib'
import { aws_ec2 as ec2, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as fs from 'node:fs'
import { CustomProps } from './custom.props'

export class SonarServerInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'PublicVpcResource', {
      vpcName: 'sonarqube-server-vpc',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      createInternetGateway: true,
      subnetConfiguration: [{
        subnetType: ec2.SubnetType.PUBLIC,
        name: 'sq-public-subnet',
        mapPublicIpOnLaunch: true
      }/*, {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        name: 'database'
      }*/]
    })

    const sonarQubeSG = new ec2.SecurityGroup(this, 'SonarQubeSecuGroupResource', {
      securityGroupName: 'SonarSecurityGroup',
      allowAllIpv6Outbound: false,
      allowAllOutbound: true,
      description: 'Inbound and outbound traffic to sonarqube server',
      disableInlineRules: false,
      vpc: vpc
    })
    sonarQubeSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.SSH, 'Allow ssh traffic')
    sonarQubeSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.HTTPS, 'Allow https traffic')
    sonarQubeSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9000), 'Allow custom port traffic')

    const keypair = new ec2.KeyPair(this, 'KeyPairResource', {
      keyPairName: 'sonarqube-server-keypair',
      type: ec2.KeyPairType.RSA,
      format: ec2.KeyPairFormat.PEM
    })

    new CfnOutput(this, 'SonarqubeKeyPairParamArn', {
      value: keypair.privateKey.parameterArn
    })

    const sonarQubeServer = new ec2.Instance(this, 'SonarQubeServerInstanceResource', {
      instanceName: 'Sonarqube-server',
      vpc,
      securityGroup: sonarQubeSG,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2, ec2.InstanceSize.MEDIUM),
      keyPair: keypair,
      associatePublicIpAddress: true,
      userDataCausesReplacement: true,
      machineImage: ec2.MachineImage.lookup({
        name: '*ubuntu*',
        filters: {
          'image-id': ['ami-0e86e20dae9224db8'],
          'architecture': ['x86_64']
        },
        windows: false
      }),
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC
      }),
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          mappingEnabled: true,// to override the default Volume mounted automatically on creation
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            deleteOnTermination: true
          })
        }
      ]
    })

    const userDataEncoded = ec2.UserData.forLinux()
    userDataEncoded.addCommands(fs.readFileSync('./assets/sonarqube-server.sh', 'utf-8'))
    sonarQubeServer.addUserData(userDataEncoded.render())

  }
}
