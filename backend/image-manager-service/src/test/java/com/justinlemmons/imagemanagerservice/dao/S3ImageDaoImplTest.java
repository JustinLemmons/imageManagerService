package com.justinlemmons.imagemanagerservice.dao;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.net.URL;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3ImageDaoImplTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    @InjectMocks
    private S3ImageDaoImpl s3ImageDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(s3ImageDao, "bucketName", "test-bucket");
    }

    @Test
    void upload_callsS3ClientWithCorrectParams() {
        byte[] data = "image-data".getBytes();

        s3ImageDao.upload("images/test.png", data, "image/png");

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));

        PutObjectRequest captured = requestCaptor.getValue();
        assertThat(captured.bucket()).isEqualTo("test-bucket");
        assertThat(captured.key()).isEqualTo("images/test.png");
        assertThat(captured.contentType()).isEqualTo("image/png");
    }

    @Test
    void generatePresignedUrl_returnsUrlString() throws Exception {
        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedRequest);
        when(presignedRequest.url()).thenReturn(new URL("https://s3.amazonaws.com/test-bucket/images/test.png?sig=abc"));

        String url = s3ImageDao.generatePresignedUrl("images/test.png");

        assertThat(url).isEqualTo("https://s3.amazonaws.com/test-bucket/images/test.png?sig=abc");
    }

    @Test
    void delete_callsS3ClientWithCorrectParams() {
        s3ImageDao.delete("images/test.png");

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());

        DeleteObjectRequest captured = requestCaptor.getValue();
        assertThat(captured.bucket()).isEqualTo("test-bucket");
        assertThat(captured.key()).isEqualTo("images/test.png");
    }
}