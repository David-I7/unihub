package com.unihub.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
@RequiredArgsConstructor
public class S3Config {

    @Autowired
    private final AwsProperties awsProperties;

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

    @Bean
    public S3Presigner s3Presigner() {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(
                awsProperties.accessKey(),
                awsProperties.secretKey()
        );

        return S3Presigner.builder()
                .credentialsProvider(() -> awsCreds)
                .region(Region.of(awsProperties.region()))
                .build();
    }
}
