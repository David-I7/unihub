package com.unihub.app.controllers;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.services.globalResources.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public ResponseEntity<PageDto<TeacherResponseDto>> getTeachers(
            @PageableDefault(page = 0, size = 20, sort = "averageRating", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<TeacherResponseDto> page = teacherService.findAll(pageable);
        return ResponseEntity.ok(page);
    }
}
