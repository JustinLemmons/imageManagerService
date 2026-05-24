package com.justinlemmons.imagemanagerservice.controller;

import com.justinlemmons.imagemanagerservice.dto.GenerateImageRequest;
import com.justinlemmons.imagemanagerservice.dto.PagedResponse;
import com.justinlemmons.imagemanagerservice.service.ImageGenerationService;
import com.justinlemmons.imagemanagerservice.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;

@RestController
@Slf4j
public class ImageController {
    private final ImageService imageService;
    private final ImageGenerationService imageGenerationService;

    public ImageController(ImageService imageService, ImageGenerationService imageGenerationService) {
        this.imageService = imageService;
        this.imageGenerationService = imageGenerationService;
    }

    @GetMapping("/health")
    public String health() {
        return "Image-Manager-Service running successfully!";
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(imageService.uploadImage(file));
    }

    @GetMapping("/images")
    public ResponseEntity<PagedResponse> getAllImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(imageService.getAllImages(page, size));
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<String> getImage(@PathVariable String id) {
        return ResponseEntity.ok(imageService.getImage(id));
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-image")
    public Mono<ResponseEntity<byte[]>> generateImage(@RequestBody GenerateImageRequest generateImageRequest) {
        return imageGenerationService.generateImage(generateImageRequest.prompt())
                .map(imageBytes -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(imageBytes))
                .onErrorResume(err -> {
                    log.error("Controller error: {}", err.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<byte[]>build());
                });
    }
}
