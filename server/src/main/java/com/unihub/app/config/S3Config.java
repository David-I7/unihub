package com.unihub.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Autowired
    private AwsProperties awsProperties;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(
                awsProperties.accessKey(),
                awsProperties.secretKey()
        );

        return S3Client.builder()
                .credentialsProvider(() -> awsCreds)
                .region(Region.of(awsProperties.region()))
                .build();
    }
}
