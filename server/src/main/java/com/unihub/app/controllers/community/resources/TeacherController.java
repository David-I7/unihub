package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherDetailResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherResponseDto;
import com.unihub.app.services.community.resources.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping("/api/v1/communities/{communitySlug}/teachers")
    public ResponseEntity<TeacherResponseDto> createTeacher(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody CreateTeacherRequestDto requestDto
    ) {
        TeacherResponseDto created = teacherService.createTeacher(communitySlug, caller, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/v1/communities/{communitySlug}/teachers")
    public ResponseEntity<PageDto<TeacherResponseDto>> getCommunityTeachers(
            @PathVariable String communitySlug,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageDto<TeacherResponseDto> page = teacherService.getPaginatedTeachers(communitySlug, search, pageable);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/api/v1/teachers/{teacherId}")
    public ResponseEntity<TeacherResponseDto> updateTeacher(
            @PathVariable UUID teacherId,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody UpdateTeacherRequestDto requestDto
    ) {
        TeacherResponseDto updated = teacherService.updateTeacher(teacherId, caller, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/v1/teachers/{teacherId}")
    public ResponseEntity<Void> deleteTeacher(
            @PathVariable UUID teacherId,
            @AuthenticationPrincipal UserDto caller
    ) {
        teacherService.deleteTeacher(teacherId, caller);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/teachers/{teacherId}")
    public ResponseEntity<TeacherDetailResponseDto> getTeacherDetail(
            @PathVariable UUID teacherId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        TeacherDetailResponseDto detail = teacherService.getTeacherDetail(teacherId, pageable);
        return ResponseEntity.ok(detail);
    }
}
