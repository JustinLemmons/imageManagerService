package com.justinlemmons.imagemanagerservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ImageGenerationResponse(@JsonProperty("data") List<ImageData> images) {
}
