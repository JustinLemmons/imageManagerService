package com.justinlemmons.imagemanagerservice.repository;

import com.justinlemmons.imagemanagerservice.entity.ImageMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageMetadataRepository extends MongoRepository<ImageMetadata, String> {}