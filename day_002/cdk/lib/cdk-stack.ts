import * as cdk from 'aws-cdk-lib'
import { aws_ec2 as ec2, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const dfVpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      //vpcName: "default",
      region: props?.env?.region,
      ownerAccountId: props?.env?.account,
      isDefault: true
    })

    const subnet = new ec2.CfnSubnet(this, 'MySubnet', {
      availabilityZone: `${props?.env?.region}a`,
      cidrBlock: '172.31.20.0/24',
      vpcId: dfVpc.vpcId,
      mapPublicIpOnLaunch: true
    })

    const sg = new ec2.CfnSecurityGroup(this, 'MySG', {
      vpcId: dfVpc.vpcId,
      groupDescription: 'Allowing SSH',
      securityGroupEgress: [{
        fromPort: 0,
        toPort: 0,
        ipProtocol: '-1',
        cidrIp: '0.0.0.0/0'
      }],
      securityGroupIngress: [{
        fromPort: 22,
        toPort: 22,
        ipProtocol: 'tcp',
        cidrIp: '0.0.0.0/0'
      }]
    })

    const keypair = new ec2.CfnKeyPair(this, 'MyKeyPair', {
      keyName: 'day2kp',
      keyType: 'rsa',
      keyFormat: 'pem'
    })

    const instance = new ec2.CfnInstance(this, 'Webserver', {
      keyName: keypair.keyName,
      securityGroupIds: [sg.attrGroupId],
      subnetId: subnet.attrSubnetId,
      instanceType: 't2.micro',
      imageId: 'ami-04b70fa74e45c3917'
    })

    new CfnOutput(this, 'IpOutput', {
      key: 'InstanceIp',
      value: instance.attrPublicIp
    })

    new CfnOutput(this, 'KeypairOutput', {
      key: 'KeypairID',
      value: keypair.attrKeyPairId
    })
  }
}
