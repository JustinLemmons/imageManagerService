package com.justinlemmons.imagemanagerservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
public class ImageController {

    @GetMapping("/health")
    public String health(){
        return "Image-Manager-Service running successfully!";
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        System.out.println("File Name: "+ file.getOriginalFilename());
        System.out.println("File Content: "+ file.getContentType());
        return ResponseEntity.ok(file.getOriginalFilename());

    }
}
