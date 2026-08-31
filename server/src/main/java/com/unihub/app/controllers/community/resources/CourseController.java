package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateFolderRequestDto;
import com.unihub.app.dto.community.content.request.CreateMaterialFileRequestDto;
import com.unihub.app.dto.community.content.request.CreateMaterialLinkRequestDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.request.PresignedUploadUrlRequestDto;
import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.content.response.PresignedUploadUrlResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCourseRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCourseRequestDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.content.CoursePostService;
import com.unihub.app.services.community.content.FolderService;
import com.unihub.app.services.community.content.MaterialFileService;
import com.unihub.app.services.community.content.MaterialLinkService;
import com.unihub.app.services.community.resources.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years/{studyYearName}/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CoursePostService coursePostService;
    private final FolderService folderService;
    private final MaterialFileService materialFileService;
    private final MaterialLinkService materialLinkService;

    @PostMapping
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:course')")
    public ResponseEntity<CourseResponseDto> createCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @Valid @RequestBody CreateCourseRequestDto requestDto
    ) {
        CourseResponseDto created = courseService.createCourse(communitySlug, studyYearName, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{courseSlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:course')")
    public ResponseEntity<CourseResponseDto> updateCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @Valid @RequestBody UpdateCourseRequestDto requestDto
    ) {
        CourseResponseDto updated = courseService.updateCourse(communitySlug, studyYearName, courseSlug, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{courseSlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'delete:course')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ) {
        courseService.deleteCourse(communitySlug, studyYearName, courseSlug);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{courseSlug}/archive")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'archive:course')")
    public ResponseEntity<CourseResponseDto> archiveCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @RequestParam(name = "archived", required = false, defaultValue = "true") boolean archived
    ) {
        CourseResponseDto updated = courseService.archiveCourse(communitySlug, studyYearName, courseSlug, archived);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{courseSlug}/teachers/{teacherId}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:course')")
    public ResponseEntity<CourseHomeResponseDto> addTeacher(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @PathVariable UUID teacherId
    ) {
        CourseHomeResponseDto response = courseService.addTeacher(communitySlug, studyYearName, courseSlug, teacherId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{courseSlug}/teachers/{teacherId}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:course')")
    public ResponseEntity<CourseHomeResponseDto> removeTeacher(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @PathVariable UUID teacherId
    ) {
        CourseHomeResponseDto response = courseService.removeTeacher(communitySlug, studyYearName, courseSlug, teacherId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{courseSlug}/home")
    public ResponseEntity<CourseHomeResponseDto> getCourseHome(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ) {
        CourseHomeResponseDto courseResponse = courseService.getCourseHome(communitySlug, studyYearName, courseSlug);
        return ResponseEntity.ok(courseResponse);
    }

    @GetMapping("/{courseSlug}/materials")
    public ResponseEntity<CourseMaterialsResponseDto> getMaterials(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @RequestParam(required = false) UUID folderId
    ) {
        CourseMaterialsResponseDto materials = courseService.getMaterials(communitySlug, studyYearName, courseSlug, folderId);
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/{courseSlug}/folders")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:folder')")
    public ResponseEntity<FolderSummaryDto> createFolder(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreateFolderRequestDto requestDto
    ) {
        FolderSummaryDto created = folderService.createFolder(communitySlug, studyYearName, courseSlug, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{courseSlug}/materials/upload-url")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:material')")
    public ResponseEntity<PresignedUploadUrlResponseDto> requestPresignedUploadUrl(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody PresignedUploadUrlRequestDto requestDto
    ) {
        PresignedUploadUrlResponseDto response = materialFileService.requestPresignedUploadUrl(
                communitySlug,
                studyYearName,
                courseSlug,
                user,
                requestDto
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseSlug}/materials/files")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:material')")
    public ResponseEntity<MaterialFileDto> createMaterialFile(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreateMaterialFileRequestDto requestDto
    ) {
        MaterialFileDto created = materialFileService.createMaterialFile(communitySlug, studyYearName, courseSlug, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{courseSlug}/materials/links")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:material')")
    public ResponseEntity<MaterialLinkDto> createMaterialLink(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreateMaterialLinkRequestDto requestDto
    ) {
        MaterialLinkDto created = materialLinkService.createMaterialLink(communitySlug, studyYearName, courseSlug, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{courseSlug}/posts")
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

    @PostMapping("/{courseSlug}/posts")
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
