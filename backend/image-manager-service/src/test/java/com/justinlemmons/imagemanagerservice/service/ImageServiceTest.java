package com.justinlemmons.imagemanagerservice.service;

import com.justinlemmons.imagemanagerservice.dao.ImageMetadataDao;
import com.justinlemmons.imagemanagerservice.dao.S3ImageDao;
import com.justinlemmons.imagemanagerservice.dto.PagedResponse;
import com.justinlemmons.imagemanagerservice.entity.ImageMetadata;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @Mock
    private S3ImageDao s3ImageDao;

    @Mock
    private ImageMetadataDao imageMetadataDao;

    @InjectMocks
    private ImageService imageService;

    @Test
    void uploadImage_uploadsToS3AndSavesMetadata_returnsId() throws IOException {
        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("test.png");
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn("data".getBytes());
        when(file.getSize()).thenReturn(4L);

        ImageMetadata saved = ImageMetadata.builder().id("abc123").build();
        when(imageMetadataDao.save(any())).thenReturn(saved);

        String result = imageService.uploadImage(file);

        assertThat(result).isEqualTo("abc123");
        verify(s3ImageDao).upload(anyString(), any(byte[].class), eq("image/png"));
        verify(imageMetadataDao).save(any(ImageMetadata.class));
    }

    @Test
    void getAllImages_returnsPagedResponse() {
        ImageMetadata m1 = ImageMetadata.builder().id("id1").build();
        ImageMetadata m2 = ImageMetadata.builder().id("id2").build();
        Page<ImageMetadata> page = new PageImpl<>(List.of(m1, m2), PageRequest.of(0, 10), 2);
        when(imageMetadataDao.findAll(any(Pageable.class))).thenReturn(page);

        PagedResponse response = imageService.getAllImages(0, 10);

        assertThat(response.ids()).containsExactly("id1", "id2");
        assertThat(response.totalElements()).isEqualTo(2);
        assertThat(response.totalPages()).isEqualTo(1);
        assertThat(response.currentPage()).isEqualTo(0);
    }

    @Test
    void getAllImages_whenEmpty_returnsEmptyList() {
        Page<ImageMetadata> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        when(imageMetadataDao.findAll(any(Pageable.class))).thenReturn(emptyPage);

        PagedResponse response = imageService.getAllImages(0, 10);

        assertThat(response.ids()).isEmpty();
        assertThat(response.totalElements()).isZero();
    }

    @Test
    void getImage_returnsPresignedUrl() {
        ImageMetadata metadata = ImageMetadata.builder()
                .id("abc123")
                .s3Key("images/abc123-test.png")
                .build();
        when(imageMetadataDao.findById("abc123")).thenReturn(Optional.of(metadata));
        when(s3ImageDao.generatePresignedUrl("images/abc123-test.png"))
                .thenReturn("https://s3.amazonaws.com/bucket/images/abc123-test.png");

        String url = imageService.getImage("abc123");

        assertThat(url).isEqualTo("https://s3.amazonaws.com/bucket/images/abc123-test.png");
    }

    @Test
    void getImage_whenNotFound_throwsException() {
        when(imageMetadataDao.findById("notfound")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> imageService.getImage("notfound"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Image not found: notfound");
    }

    @Test
    void deleteImage_deletesFromS3AndMongoDB() {
        ImageMetadata metadata = ImageMetadata.builder()
                .id("abc123")
                .s3Key("images/abc123-test.png")
                .build();
        when(imageMetadataDao.findById("abc123")).thenReturn(Optional.of(metadata));

        imageService.deleteImage("abc123");

        verify(s3ImageDao).delete("images/abc123-test.png");
        verify(imageMetadataDao).deleteById("abc123");
    }

    @Test
    void deleteImage_whenNotFound_throwsException() {
        when(imageMetadataDao.findById("notfound")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> imageService.deleteImage("notfound"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Image not found: notfound");
    }
}