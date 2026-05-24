package com.justinlemmons.imagemanagerservice.controller;

import com.justinlemmons.imagemanagerservice.dto.PagedResponse;
import com.justinlemmons.imagemanagerservice.service.ImageGenerationService;
import com.justinlemmons.imagemanagerservice.service.ImageService;
import com.justinlemmons.imagemanagerservice.dto.GenerateImageRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ImageControllerTest {

    @Mock
    private ImageService imageService;

    @Mock
    private ImageGenerationService imageGenerationService;

    @InjectMocks
    private ImageController imageController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(imageController).build();
    }

    @Test
    void health_returnsOk() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Image-Manager-Service running successfully!"));
    }

    @Test
    void upload_returnsImageId() throws Exception {
        when(imageService.uploadImage(any())).thenReturn("abc123");
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "data".getBytes());

        mockMvc.perform(multipart("/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(content().string("abc123"));
    }

    @Test
    void getAllImages_returnsPagedResponse() throws Exception {
        PagedResponse response = new PagedResponse(List.of("id1", "id2"), 2, 1, 0);
        when(imageService.getAllImages(0, 10)).thenReturn(response);

        mockMvc.perform(get("/images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ids[0]").value("id1"))
                .andExpect(jsonPath("$.ids[1]").value("id2"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.currentPage").value(0));
    }

    @Test
    void getAllImages_withCustomPageParams_passesThrough() throws Exception {
        PagedResponse response = new PagedResponse(List.of("id1"), 1, 1, 2);
        when(imageService.getAllImages(2, 5)).thenReturn(response);

        mockMvc.perform(get("/images").param("page", "2").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(2));
    }

    @Test
    void getImage_returnsPresignedUrl() throws Exception {
        when(imageService.getImage("abc123")).thenReturn("https://s3.amazonaws.com/bucket/key");

        mockMvc.perform(get("/images/abc123"))
                .andExpect(status().isOk())
                .andExpect(content().string("https://s3.amazonaws.com/bucket/key"));
    }

    @Test
    void deleteImage_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/images/abc123"))
                .andExpect(status().isNoContent());

        verify(imageService).deleteImage("abc123");
    }

    @Test
    void generateImage_returnsImageBytes() {
        byte[] imageBytes = "fake-image-data".getBytes();
        when(imageGenerationService.generateImage("a sunset")).thenReturn(Mono.just(imageBytes));

        Mono<ResponseEntity<byte[]>> result = imageController.generateImage(new GenerateImageRequest("a sunset"));

        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                    assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
                    assertThat(response.getBody()).isEqualTo(imageBytes);
                })
                .verifyComplete();
    }

    @Test
    void generateImage_whenServiceFails_returns500() {
        when(imageGenerationService.generateImage(any()))
                .thenReturn(Mono.error(new RuntimeException("HF API error")));

        Mono<ResponseEntity<byte[]>> result = imageController.generateImage(new GenerateImageRequest("a sunset"));

        StepVerifier.create(result)
                .assertNext(response ->
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR))
                .verifyComplete();
    }
}