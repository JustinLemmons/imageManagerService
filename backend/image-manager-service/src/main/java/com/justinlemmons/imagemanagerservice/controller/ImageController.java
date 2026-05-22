package com.justinlemmons.imagemanagerservice.controller;

import com.justinlemmons.imagemanagerservice.service.ImageGenerationService;
import com.justinlemmons.imagemanagerservice.service.ImageService;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE})
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
    public ResponseEntity<List<String>> getAllImages() throws IOException {
        return ResponseEntity.ok(imageService.getAllImages());
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> getImage(@PathVariable String id) {
        GridFsResource resource = (GridFsResource) imageService.getImage(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getContentType()))
                .body(resource);
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-image")
    public Mono<ResponseEntity<byte[]>> generateImage(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");

        return imageGenerationService.generateImage(prompt)
                .map(imageBytes -> ResponseEntity.ok()
                        .header("Content-Type", "image/png")
                        .body(imageBytes))
                .onErrorResume(err -> {
                    System.err.println("Controller error: " + err.getMessage());
                    return Mono.just(ResponseEntity.status(500).<byte[]>build());
                });
    }
}
