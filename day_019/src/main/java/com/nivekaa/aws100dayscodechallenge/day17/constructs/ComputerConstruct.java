package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.apache.commons.lang3.StringUtils;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.CfnOutputProps;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.iam.*;
import software.constructs.Construct;

public class ComputerConstruct extends Construct {

  private final IInstance computer;
  private final IRole role;

  public ComputerConstruct(
      Construct scope, String id, ComputerProps computerProps, StackProps props) {

    super(scope, id);

    SecurityGroup securityGroup =
        new SecurityGroup(
            this,
            "WebserverSG%sResource".formatted(computerProps.instanceName()),
            SecurityGroupProps.builder()
                .allowAllOutbound(true)
                .securityGroupName("security-group-%s".formatted(computerProps.instanceName()))
                .disableInlineRules(true)
                .vpc(computerProps.vpc())
                .description("Allow trafic from/to webserver instance")
                .build());

    if (computerProps.allowSSHConnection()) {
      securityGroup.addIngressRule(Peer.anyIpv4(), Port.SSH, "Allow ssh traffic");
    }
    if (computerProps.hostedAppPort() != null && computerProps.hostedAppPort() != 0) {
      securityGroup.addIngressRule(
          Peer.anyIpv4(), Port.tcp(computerProps.hostedAppPort()), "Allow traffic from 8089 port");
    }

    this.role = buildInstanceRole(computerProps);

    InstanceProps.Builder instanceBuilder = InstanceProps.builder();

    if (computerProps.enableKeyPair()) {
      KeyPair keyPair =
          new KeyPair(
              this,
              "KeyPair%sResource".formatted(computerProps.instanceName()),
              KeyPairProps.builder()
                  .keyPairName("ws-keypair-%s".formatted(computerProps.instanceName()))
                  .account(Objects.requireNonNull(props.getEnv()).getAccount())
                  .type(KeyPairType.RSA)
                  .format(KeyPairFormat.PEM)
                  .build());

      new CfnOutput(
          this,
          "KeyPairId-%s".formatted(computerProps.instanceName()),
          CfnOutputProps.builder().value(keyPair.getKeyPairId()).build());
      instanceBuilder.keyPair(keyPair);
    }

    Instance ec2Instance =
        new Instance(
            this,
            "WebServerInstance%sResource".formatted(computerProps.instanceName()),
            instanceBuilder
                .securityGroup(securityGroup)
                .instanceName("Webserver-Instance-%s".formatted(computerProps.instanceName()))
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
                .role(this.getRole())
                .instanceType(InstanceType.of(InstanceClass.T2, InstanceSize.MICRO))
                .associatePublicIpAddress(true)
                .blockDevices(
                    List.of(
                        BlockDevice.builder()
                            .mappingEnabled(true)
                            .deviceName("/dev/sda1")
                            .volume(
                                BlockDeviceVolume.ebs(
                                    computerProps.volumeSize() == 0
                                        ? 10
                                        : computerProps.volumeSize(),
                                    EbsDeviceOptions.builder()
                                        .deleteOnTermination(true)
                                        .volumeType(EbsDeviceVolumeType.GP3)
                                        .build()))
                            .build()))
                .userDataCausesReplacement(StringUtils.isNotBlank(computerProps.bootstrapScript()))
                .vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PUBLIC).build())
                .build());

    if (StringUtils.isNotBlank(computerProps.bootstrapScript())) {
      UserData userData = UserData.forLinux();
      userData.addCommands(readFile(computerProps.bootstrapScript()));
      ec2Instance.addUserData(userData.render());
    }

    this.computer = ec2Instance;
  }

  public IInstance getComputer() {
    return computer;
  }

  public IRole getRole() {
    return role;
  }

  public void addPolicyToComputer(PolicyStatement... statements) {
    for (PolicyStatement statement : statements) {
      this.role.addToPrincipalPolicy(statement);
    }
  }

  public void addSecurityGroup(ISecurityGroup securityGroup) {
    Instance instance = (Instance) this.computer;
    instance.addSecurityGroup(securityGroup);
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
        "WebserverInstanceRole%sResource".formatted(props.instanceName()),
        RoleProps.builder()
            .roleName("webserver-role-%s".formatted(props.instanceName()))
            .assumedBy(new ServicePrincipal("ec2.amazonaws.com"))
            .path("/")
            .build());
  }
}
