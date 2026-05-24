package com.justinlemmons.imagemanagerservice.service;

import com.justinlemmons.imagemanagerservice.dao.S3ImageDao;
import com.justinlemmons.imagemanagerservice.dto.PagedResponse;
import com.justinlemmons.imagemanagerservice.entity.ImageMetadata;
import com.justinlemmons.imagemanagerservice.repository.ImageMetadataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ImageService {

    private final S3ImageDao s3ImageDao;
    private final ImageMetadataRepository imageMetadataRepository;

    public ImageService(S3ImageDao s3ImageDao, ImageMetadataRepository imageMetadataRepository) {
        this.s3ImageDao = s3ImageDao;
        this.imageMetadataRepository = imageMetadataRepository;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        String s3Key = UUID.randomUUID() + "-" + file.getOriginalFilename();

        s3ImageDao.upload(s3Key, file.getBytes(), file.getContentType());

        ImageMetadata metadata = ImageMetadata.builder()
                .filename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .size(file.getSize())
                .s3Key(s3Key)
                .createdAt(LocalDateTime.now())
                .build();

        String id = imageMetadataRepository.save(metadata).getId();
        log.info("Uploaded image {} with S3 key {}", id, s3Key);
        return id;
    }

    public PagedResponse getAllImages(int page, int size) {
        Page<ImageMetadata> result = imageMetadataRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<String> ids = result.getContent().stream()
                .map(ImageMetadata::getId)
                .toList();

        return new PagedResponse(ids, result.getTotalElements(), result.getTotalPages(), page);
    }

    public String getImage(String id) {
        ImageMetadata metadata = imageMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found: " + id));

        return s3ImageDao.generatePresignedUrl(metadata.getS3Key());
    }

    public void deleteImage(String id) {
        ImageMetadata metadata = imageMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found: " + id));

        s3ImageDao.delete(metadata.getS3Key());
        imageMetadataRepository.deleteById(id);
        log.info("Deleted image {} with S3 key {}", id, metadata.getS3Key());
    }
}