package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import java.util.List;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.*;
import software.constructs.Construct;

public class NetworkContruct extends Construct {
  private final IVpc vpc;

  public NetworkContruct(Construct scope, String id, StackProps props) {
    super(scope, id);

    this.vpc =
        new Vpc(
            this,
            "VpcResource",
            VpcProps.builder()
                .vpcName("my-vpc")
                .enableDnsHostnames(true)
                .enableDnsSupport(true)
                .createInternetGateway(true)
                .ipProtocol(IpProtocol.IPV4_ONLY)
                .ipAddresses(IpAddresses.cidr("10.0.0.1/16"))
                .maxAzs(1)
                .subnetConfiguration(
                    List.of(
                        SubnetConfiguration.builder()
                            .name("Public-Subnet")
                            .mapPublicIpOnLaunch(true)
                            .subnetType(SubnetType.PUBLIC)
                            .build()))
                .build());
  }

  public IVpc getVpc() {
    return vpc;
  }
}
