package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import software.amazon.awscdk.services.ec2.IVpc;

public record ComputerProps(IVpc vpc, String sqsQueueArn) {}
