package com.unihub.app.services.storage;

import java.time.Duration;

public interface FileStorageService {

    String generatePresignedUploadUrl(String storageKey, String contentType, long contentLength, Duration duration);

    String generatePresignedDownloadUrl(String storageKey, Duration duration);

    void deleteFile(String storageKey);

    boolean fileExists(String storageKey);

    long getFileSize(String storageKey);
}
