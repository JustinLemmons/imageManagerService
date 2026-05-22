package com.justinlemmons.imagemanagerservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ImageData(@JsonProperty("b64_json") String base64_json) {
}
