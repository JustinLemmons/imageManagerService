package com.justinlemmons.imagemanagerservice.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@Document(collection = "image_metadata")
public class ImageMetadata {

    @Id
    private String id;
    private String filename;
    private String contentType;
    private long size;
    private String s3Key;
    private LocalDateTime createdAt;
}