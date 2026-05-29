package com.justinlemmons.imagemanagerservice.dao;

import com.justinlemmons.imagemanagerservice.entity.ImageMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ImageMetadataDao {
    ImageMetadata save(ImageMetadata metadata);
    Optional<ImageMetadata> findById(String id);
    Page<ImageMetadata> findAll(Pageable pageable);
    void deleteById(String id);
}