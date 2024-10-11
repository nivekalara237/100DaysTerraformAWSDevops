package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.CfnOutputProps;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.iam.*;
import software.constructs.Construct;

public class ComputerConstruct extends Construct {

  private final IInstance computer;

  public ComputerConstruct(
      Construct scope, String id, ComputerProps computerProps, StackProps props) {

    super(scope, id);

    SecurityGroup securityGroup =
        new SecurityGroup(
            this,
            "WebserverSGResource",
            SecurityGroupProps.builder()
                .allowAllOutbound(true)
                .securityGroupName("Webserver-security-group")
                .disableInlineRules(true)
                .vpc(computerProps.vpc())
                .description("Allow trafic from/to webserver instance")
                .build());

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.SSH, "Allow ssh traffic");
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(8089), "Allow traffic from 8089 port");

    KeyPair keyPair =
        new KeyPair(
            this,
            "KeyPairResource",
            KeyPairProps.builder()
                .keyPairName("ws-keypair")
                .account(Objects.requireNonNull(props.getEnv()).getAccount())
                .type(KeyPairType.RSA)
                .format(KeyPairFormat.PEM)
                .build());

    new CfnOutput(
        this, "KeyPairId", CfnOutputProps.builder().value(keyPair.getKeyPairId()).build());

    Instance ec2Instance =
        new Instance(
            this,
            "WebServerInstanceResource",
            InstanceProps.builder()
                .securityGroup(securityGroup)
                .keyPair(keyPair)
                .instanceName("Webserver-Instance")
                .machineImage(
                    MachineImage.lookup(
                        LookupMachineImageProps.builder()
                            .name("*ubuntu*")
                            .filters(
                                Map.ofEntries(
                                    Map.entry("image-id", List.of("ami-0e86e20dae9224db8")),
                                    Map.entry("architecture", List.of("x86_64"))))
                            .windows(false)
                            .build()))
                .vpc(computerProps.vpc())
                .role(buildInstanceRole(computerProps))
                .instanceType(InstanceType.of(InstanceClass.T2, InstanceSize.MICRO))
                .associatePublicIpAddress(true)
                .blockDevices(
                    List.of(
                        BlockDevice.builder()
                            .mappingEnabled(true)
                            .deviceName("/dev/sda1")
                            .volume(
                                BlockDeviceVolume.ebs(
                                    10,
                                    EbsDeviceOptions.builder()
                                        .deleteOnTermination(true)
                                        .volumeType(EbsDeviceVolumeType.GP3)
                                        .build()))
                            .build()))
                .userDataCausesReplacement(true)
                .vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PUBLIC).build())
                .build());

    UserData userData = UserData.forLinux();
    userData.addCommands(readFile("./webserver-startup.sh"));

    ec2Instance.addUserData(userData.render());

    this.computer = ec2Instance;
  }

  public IInstance getComputer() {
    return computer;
  }

  private String readFile(String filename) {

    InputStream scriptFileStream = getClass().getClassLoader().getResourceAsStream(filename);

    try {
      assert scriptFileStream != null;
      try (InputStreamReader isr = new InputStreamReader(scriptFileStream, StandardCharsets.UTF_8);
          BufferedReader br = new BufferedReader(isr)) {
        StringBuilder content = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
          content.append(line).append("\n");
        }
        return content.toString();
      }
    } catch (IOException e) {
      throw new RuntimeException(e.getMessage());
    }
  }

  private IRole buildInstanceRole(ComputerProps props) {
    return new Role(
        this,
        "WebserverInstanceRoleResource",
        RoleProps.builder()
            .roleName("webserver-role")
            .assumedBy(new ServicePrincipal("ec2.amazonaws.com"))
            .path("/")
            .inlinePolicies(
                Map.ofEntries(
                    Map.entry(
                        "sqs",
                        new PolicyDocument(
                            PolicyDocumentProps.builder()
                                .assignSids(true)
                                .statements(
                                    List.of(
                                        new PolicyStatement(
                                            PolicyStatementProps.builder()
                                                .effect(Effect.ALLOW)
                                                .actions(
                                                    List.of(
                                                        "sqs:DeleteMessage",
                                                        "sqs:ReceiveMessage",
                                                        "sqs:SendMessage",
                                                        "sqs:GetQueueAttributes",
                                                        "sqs:GetQueueUrl"))
                                                .resources(List.of(props.sqsQueueArn()))
                                                .build())))
                                .build()))))
            .build());
  }
}
