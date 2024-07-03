import * as cdk from 'aws-cdk-lib';
import {aws_ec2 as ec2, Fn} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {readFileSync} from "fs";
import {UserData} from "aws-cdk-lib/aws-ec2";

export interface Day1StackProps extends cdk.StackProps {
    cidrVpc: string,
    cidrVpcInternet: string,
    keyName: string
}

export class CdkStack extends cdk.Stack {
    _props: Day1StackProps = {} as Day1StackProps;

    constructor(scope: Construct, id: string, props: Day1StackProps) {
        super(scope, id, props);
        this._props = props;

        // Create the network
        const {vpc, subnet} = this.createNetworkSet(props);
        const {sg, kp} = this.createSecuritySet(vpc, props);
        const userDataEncoded = UserData.forLinux();
        userDataEncoded.addCommands(readFileSync("./assets/ec2_bootstrap_script.sh", "utf-8"))
        const webserver = new ec2.CfnInstance(this, "WebInstance", {
            keyName: kp.keyName,
            subnetId: subnet.attrSubnetId,
            instanceType: "t2.micro",
            imageId: "ami-04b70fa74e45c3917",
            securityGroupIds: [sg.attrGroupId],
            userData: Fn.base64(userDataEncoded.render()),
            tags: this.defaultTagsAndName("Webserver-Instance")
        });

        webserver.addDependency(sg);
        webserver.addDependency(subnet);
        new cdk.CfnOutput(this, "PublicAddrOutput", {
            key: "PublicAddr",
            value: JSON.stringify({ip: webserver.attrPublicIp, dns: webserver.attrPublicDnsName})
        });
    }

    private defaultTagsAndName = (valueOfKeyName: string) => {
        return [...(Object.keys(this._props?.tags || {})
            .filter(v => !!v)
            .map(v => ({key: v, value: (this._props?.tags?.[v] || '')})) || []),
            {
                key: "Name",
                value: valueOfKeyName
            }
        ];
    }

    private createNetworkSet = (props: Day1StackProps) => {
        const vpc = new ec2.CfnVPC(this, "MainVpc", {
            enableDnsHostnames: true,
            enableDnsSupport: true,
            instanceTenancy: "default",
            cidrBlock: props.cidrVpc,
            tags: this.defaultTagsAndName("Main-Vpc"),
        });

        const publicSubnet = new ec2.CfnSubnet(this, "PublicSubnet", {
            cidrBlock: "10.0.8.0/24",
            vpcId: vpc.attrVpcId,
            availabilityZone: (props.env?.region || 'us-east-1') + "a",
            mapPublicIpOnLaunch: true,
            tags: this.defaultTagsAndName("Public-Subnet")
        });

        const igw = new ec2.CfnInternetGateway(this, "InternetGateway", {
            tags: [...this.defaultTagsAndName("InternetGW")],
        });

        igw.addDependency(vpc);

        new ec2.CfnVPCGatewayAttachment(this, `VpcGatewayAttachment`, {
            vpcId: vpc.attrVpcId,
            internetGatewayId: igw.attrInternetGatewayId,
        });

        const routeTable = new ec2.CfnRouteTable(this, "RouteTable", {
            vpcId: vpc.attrVpcId,
            tags: [...this.defaultTagsAndName("RouteTable")],
        });

        const routeGateway = new ec2.CfnRoute(this, "Route", {
            routeTableId: routeTable.attrRouteTableId,
            destinationCidrBlock: props.cidrVpcInternet,
            gatewayId: igw.attrInternetGatewayId
        });

        new ec2.CfnSubnetRouteTableAssociation(this, `SubnetRouteTable-attach`, {
            subnetId: publicSubnet.attrSubnetId,
            routeTableId: routeTable.attrRouteTableId
        });
        return {
            vpc,
            routeTable,
            routeGateway,
            subnet: publicSubnet
        };
    }

    private createSecuritySet = (vpc: ec2.CfnVPC, props: Day1StackProps) => {
        const securityGroup = new ec2.CfnSecurityGroup(this, "SecurityGroup", {
            groupDescription: "Allowing traffic from/to instance",
            groupName: "allow-http-and-ssh",
            vpcId: vpc.attrVpcId,
            securityGroupEgress: [{
                fromPort: 0,
                toPort: 0,
                ipProtocol: '-1',
                description: "Allow the outbound traffic to anywhere",
                cidrIp: props.cidrVpcInternet
            }],
            securityGroupIngress: [{
                fromPort: 22,
                toPort: 22,
                ipProtocol: "tcp",
                description: "Allow SSH traffic",
                cidrIp: props.cidrVpcInternet
            },
                {
                    fromPort: 80,
                    toPort: 80,
                    ipProtocol: "tcp",
                    description: "Allow HTTP traffic",
                    cidrIp: props.cidrVpcInternet
                }],
            tags: this.defaultTagsAndName("WebserverSG")
        });

        // key pair for ssh connection
        const keypair = new ec2.CfnKeyPair(this, "InstanceKeyPair", {
            keyName: props.keyName,
            keyType: "rsa",
            keyFormat: "pem",
            tags: this.defaultTagsAndName("Webserver-KeyPair")
        });

        return {
            sg: securityGroup,
            kp: keypair
        };
    };
}
