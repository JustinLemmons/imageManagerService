package com.justinlemmons.imagemanagerservice.dao;

import com.justinlemmons.imagemanagerservice.entity.ImageMetadata;
import com.justinlemmons.imagemanagerservice.repository.ImageMetadataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class ImageMetadataDaoImpl implements ImageMetadataDao {

    private final ImageMetadataRepository imageMetadataRepository;

    public ImageMetadataDaoImpl(ImageMetadataRepository imageMetadataRepository) {
        this.imageMetadataRepository = imageMetadataRepository;
    }

    @Override
    public ImageMetadata save(ImageMetadata metadata) {
        return imageMetadataRepository.save(metadata);
    }

    @Override
    public Optional<ImageMetadata> findById(String id) {
        return imageMetadataRepository.findById(id);
    }

    @Override
    public Page<ImageMetadata> findAll(Pageable pageable) {
        return imageMetadataRepository.findAll(pageable);
    }

    @Override
    public void deleteById(String id) {
        imageMetadataRepository.deleteById(id);
    }
}