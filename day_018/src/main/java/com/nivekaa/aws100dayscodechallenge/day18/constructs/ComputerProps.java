package com.nivekaa.aws100dayscodechallenge.day18.constructs;

import lombok.Builder;
import software.amazon.awscdk.services.ec2.IVpc;

@Builder
public record ComputerProps(IVpc vpc, int port) {}
