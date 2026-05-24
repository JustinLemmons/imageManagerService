package com.justinlemmons.imagemanagerservice.dto;

import java.util.List;

public record PagedResponse(
        List<String> ids,
        long totalElements,
        int totalPages,
        int currentPage
) {}