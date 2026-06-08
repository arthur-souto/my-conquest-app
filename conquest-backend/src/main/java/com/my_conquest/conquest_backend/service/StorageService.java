package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.config.R2Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner resigned;
    private final R2Properties properties;
    private static final String UPLOAD_URL = "uploadUrl";
    private static final String PUBLIC_URL = "publicUrl";
    private static final int SIGNATURE_DURATION_MINUTES = 5;

    public Map<String, String> getImageUploadUrl(String fileName, String type, UUID id) {
        return getPresignedUrl(
                properties.getBucketImages(),
                properties.getPublicUrlImages(),
                fileName,
                type,
                id
        );
    }

    public Map<String, String> getPdfUploadUrl(String fileName, String type, UUID id) {
        return getPresignedUrl(
                properties.getBucketPdfs(),
                properties.getPublicUrlPdfs(),
                fileName,
                type,
                id
        );
    }

    private Map<String, String> getPresignedUrl(String bucket, String publicUrl, String fileName, String type, UUID id) {
        String key = type + "/" + id.toString() + "/" + System.currentTimeMillis() + "-" + fileName;

        PresignedPutObjectRequest presigned = resigned.presignPutObject(r -> r
                .signatureDuration(Duration.ofMinutes(SIGNATURE_DURATION_MINUTES))
                .putObjectRequest( obj -> obj
                        .bucket(bucket)
                        .key(key)
                        .build())
                .build());

        return Map.of(
                UPLOAD_URL, presigned.url().toString(),
                PUBLIC_URL, publicUrl + "/" + key

        );
    }

}
