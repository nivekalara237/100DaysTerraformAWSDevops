package com.nivekaa.msproducer;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.InstanceProfileCredentialsProvider;
import software.amazon.awssdk.regions.providers.AwsRegionProvider;
import software.amazon.awssdk.regions.providers.InstanceProfileRegionProvider;

@Configuration
public class ApplocationConfiguration {

  @Bean
  public AwsRegionProvider awsRegionProvider() {
    return new InstanceProfileRegionProvider();
  }


  @Bean
  public AwsCredentialsProvider awsCredentialsProvider() {
    return InstanceProfileCredentialsProvider.builder()
        .asyncCredentialUpdateEnabled(false)
        .build();
  }
}
