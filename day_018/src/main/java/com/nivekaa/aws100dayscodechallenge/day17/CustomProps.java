package com.nivekaa.aws100dayscodechallenge.day17;

import lombok.Builder;
import software.amazon.awscdk.StackProps;


@Builder
public class CustomProps {

  private String cidr;
}
