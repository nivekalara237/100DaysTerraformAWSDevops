package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import lombok.Builder;
import software.amazon.awscdk.services.ec2.IVpc;

@Builder
public record ComputerProps(
    IVpc vpc,
    String instanceName,
    Integer hostedAppPort,
    boolean allowSSHConnection,
    boolean enableKeyPair,
    int volumeSize,
    String bootstrapScript) {}
