package com.unihub.app.mappers;

import com.unihub.app.dto.PageDto;
import org.springframework.stereotype.Component;

@Component
public class PageMapper {

    public <T> PageDto<T> toPageDto(org.springframework.data.domain.Page<T> page) {
        return PageDto.<T>builder()
                .content(page.getContent())
                .number(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
