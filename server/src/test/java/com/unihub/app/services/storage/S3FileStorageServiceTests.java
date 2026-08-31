package com.unihub.app.services.storage;

import com.unihub.app.config.AwsProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class S3FileStorageServiceTests {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private PresignedPutObjectRequest presignedPutObjectRequest;

    @Mock
    private PresignedGetObjectRequest presignedGetObjectRequest;

    private AwsProperties awsProperties;
    private S3FileStorageService s3FileStorageService;

    @BeforeEach
    public void setUp() {
        awsProperties = new AwsProperties(
                "test-access-key",
                "test-secret-key",
                "eu-central-1",
                "test-bucket"
        );
        s3FileStorageService = new S3FileStorageService(s3Client, s3Presigner, awsProperties);
    }

    @Test
    @DisplayName("Generate presigned upload URL via S3Presigner")
    public void testGeneratePresignedUploadUrl() throws Exception {
        when(presignedPutObjectRequest.url()).thenReturn(new URI("https://test-bucket.s3.amazonaws.com/upload-key").toURL());
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPutObjectRequest);

        String url = s3FileStorageService.generatePresignedUploadUrl("upload-key", "application/pdf", 1024, Duration.ofMinutes(5));
        assertEquals("https://test-bucket.s3.amazonaws.com/upload-key", url);
    }

    @Test
    @DisplayName("Generate presigned download URL via S3Presigner")
    public void testGeneratePresignedDownloadUrl() throws Exception {
        when(presignedGetObjectRequest.url()).thenReturn(new URI("https://test-bucket.s3.amazonaws.com/download-key").toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedGetObjectRequest);

        String url = s3FileStorageService.generatePresignedDownloadUrl("download-key", Duration.ofHours(1));
        assertEquals("https://test-bucket.s3.amazonaws.com/download-key", url);
    }

    @Test
    @DisplayName("Delete file from S3 bucket")
    public void testDeleteFile() {
        s3FileStorageService.deleteFile("delete-key");
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    @DisplayName("Check file existence and size in S3")
    public void testFileExistsAndSize() {
        HeadObjectResponse headResponse = HeadObjectResponse.builder()
                .contentLength(2048L)
                .build();
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(headResponse);

        assertTrue(s3FileStorageService.fileExists("existing-key"));
        assertEquals(2048L, s3FileStorageService.getFileSize("existing-key"));
    }

    @Test
    @DisplayName("File exists returns false when NoSuchKeyException is thrown")
    public void testFileDoesNotExist() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenThrow(NoSuchKeyException.builder().message("Not found").build());

        assertFalse(s3FileStorageService.fileExists("non-existing-key"));
    }
}
