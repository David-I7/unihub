package com.unihub.app.services.storage;

import com.unihub.app.config.AwsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
@RequiredArgsConstructor
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AwsProperties awsProperties;

    @Override
    public String generatePresignedUploadUrl(String storageKey, String contentType, long contentLength, Duration duration) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(awsProperties.bucketName())
                .key(storageKey)
                .contentType(contentType)
                .contentLength(contentLength)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(duration)
                .putObjectRequest(putObjectRequest)
                .build();

        return s3Presigner.presignPutObject(presignRequest).url().toString();
    }

    @Override
    public String generatePresignedDownloadUrl(String storageKey, Duration duration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(awsProperties.bucketName())
                .key(storageKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    @Override
    public void deleteFile(String storageKey) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(awsProperties.bucketName())
                .key(storageKey)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    @Override
    public boolean fileExists(String storageKey) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(awsProperties.bucketName())
                    .key(storageKey)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return false;
            }
            throw e;
        }
    }

    @Override
    public long getFileSize(String storageKey) {
        HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(awsProperties.bucketName())
                .key(storageKey)
                .build();

        HeadObjectResponse response = s3Client.headObject(headObjectRequest);
        return response.contentLength();
    }
}
