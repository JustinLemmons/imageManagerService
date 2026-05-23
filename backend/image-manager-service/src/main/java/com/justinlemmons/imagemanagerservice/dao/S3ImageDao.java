package com.justinlemmons.imagemanagerservice.dao;

public interface S3ImageDao {
    void upload(String key, byte[] data, String contentType);
    String generatePresignedUrl(String key);
    void delete(String key);
}