package com.nivekaa.gencode;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.InstanceProfileCredentialsProvider;
import software.amazon.awssdk.regions.providers.AwsRegionProvider;
import software.amazon.awssdk.regions.providers.InstanceProfileRegionProvider;

@Configuration
public class ApplicationConfiguration {


    @Bean
    public AwsRegionProvider customRegionProvider() {
        return new InstanceProfileRegionProvider();
    }

    @Bean
    public AwsCredentialsProvider customInstanceCredProvider() {
        return  InstanceProfileCredentialsProvider.builder()
                .build();
    }


}
