package com.unihub.app.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record PageDto<T> (List<T> content, int number, int size, long totalElements, int totalPages, boolean last, boolean first) {
}
