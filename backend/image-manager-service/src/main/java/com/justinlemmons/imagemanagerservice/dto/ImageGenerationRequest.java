package com.justinlemmons.imagemanagerservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageGenerationRequest {
    private String prompt;
    private String model;
    private String response_format;
}
