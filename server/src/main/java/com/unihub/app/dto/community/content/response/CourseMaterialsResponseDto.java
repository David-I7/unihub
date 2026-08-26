package com.unihub.app.dto.community.content.response;

import lombok.Builder;

import java.util.List;

@Builder
public record CourseMaterialsResponseDto(
        List<FolderSummaryDto> folders,
        List<MaterialFileDto> files,
        List<MaterialLinkDto> links
) {
}
