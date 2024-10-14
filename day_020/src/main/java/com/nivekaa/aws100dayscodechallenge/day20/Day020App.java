package com.nivekaa.aws100dayscodechallenge.day20;

import com.nivekaa.aws100dayscodechallenge.day20.stacks.MyStack;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

public class Day020App {
  public static void main(final String[] args) {
    App app = new App();

    new MyStack(
        app,
        "Day020Stack",
        StackProps.builder()
            .env(
                Environment.builder()
                    .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                    .region(System.getenv("CDK_DEFAULT_REGION"))
                    .build())
            .build());

    app.synth();
  }
}
