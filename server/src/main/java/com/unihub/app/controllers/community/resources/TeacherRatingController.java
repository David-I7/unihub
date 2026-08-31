package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingResponseDto;
import com.unihub.app.services.community.resources.TeacherRatingService;
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
public class TeacherRatingController {

    private final TeacherRatingService teacherRatingService;

    @PostMapping("/api/v1/teachers/{teacherId}/ratings")
    public ResponseEntity<TeacherRatingResponseDto> createRating(
            @PathVariable UUID teacherId,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody CreateTeacherRatingRequestDto requestDto
    ) {
        TeacherRatingResponseDto created = teacherRatingService.createRating(teacherId, caller, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/v1/teachers/{teacherId}/ratings/{ratingId}")
    public ResponseEntity<TeacherRatingResponseDto> updateRating(
            @PathVariable UUID teacherId,
            @PathVariable Long ratingId,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody UpdateTeacherRatingRequestDto requestDto
    ) {
        TeacherRatingResponseDto updated = teacherRatingService.updateRating(teacherId, ratingId, caller, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/v1/teachers/{teacherId}/ratings/{ratingId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable UUID teacherId,
            @PathVariable Long ratingId,
            @AuthenticationPrincipal UserDto caller
    ) {
        teacherRatingService.deleteRating(teacherId, ratingId, caller);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/teachers/{teacherId}/ratings")
    public ResponseEntity<PageDto<TeacherRatingResponseDto>> getTeacherRatings(
            @PathVariable UUID teacherId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<TeacherRatingResponseDto> ratings = teacherRatingService.getPaginatedRatings(teacherId, pageable);
        return ResponseEntity.ok(ratings);
    }
}
