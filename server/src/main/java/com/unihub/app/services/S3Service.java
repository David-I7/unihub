package com.unihub.app.services;

import com.unihub.app.config.AwsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    private final AwsProperties awsProperties;

    public String generatePresignedUrl(String objectKey){
        return null;
    }
}
