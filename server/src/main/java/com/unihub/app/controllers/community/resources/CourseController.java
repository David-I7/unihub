package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.content.CoursePostService;
import com.unihub.app.services.community.resources.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years/{studyYearName}/courses/{courseSlug}")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CoursePostService coursePostService;

    @GetMapping("/home")
    public ResponseEntity<CourseHomeResponseDto> getCourseHome(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ){
        CourseHomeResponseDto courseResponse = courseService.getCourseHome(communitySlug, studyYearName, courseSlug);
        return ResponseEntity.ok(courseResponse);
    }

    @GetMapping("/materials")
    public ResponseEntity<CourseMaterialsResponseDto> getMaterials(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @RequestParam(required = false) UUID folderId
    ) {
        CourseMaterialsResponseDto materials = courseService.getMaterials(communitySlug, studyYearName, courseSlug, folderId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/posts")
    public ResponseEntity<PageDto<PostResponseDto>> getCoursePosts(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @PageableDefault(page = 0, size = 10) Pageable pageable
    ) {
        PageDto<PostResponseDto> posts = coursePostService.getCoursePosts(communitySlug, studyYearName, courseSlug, user, pageable);
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/posts")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:post')")
    public ResponseEntity<PostResponseDto> createCoursePost(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreatePostRequestDto requestDto
    ) {
        PostResponseDto created = coursePostService.createCoursePost(communitySlug, studyYearName, courseSlug, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
