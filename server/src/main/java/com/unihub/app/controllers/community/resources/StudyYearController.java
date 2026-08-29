package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.response.CourseIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.resources.StudyYearService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years")
@RequiredArgsConstructor
public class StudyYearController {

    private final StudyYearService studyYearService;

    @PostMapping
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:studyYear')")
    public ResponseEntity<StudyYearResponseDto> createStudyYear(
            @PathVariable String communitySlug,
            @Valid @RequestBody CreateStudyYearRequestDto requestDto
    ) {
        StudyYearResponseDto created = studyYearService.createStudyYear(communitySlug, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{studyYearName}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'delete:studyYear')")
    public ResponseEntity<Void> deleteStudyYear(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName
    ) {
        studyYearService.deleteStudyYear(communitySlug, studyYearName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{studyYearName}/home")
    public ResponseEntity<StudyYearHomeResponseDto> getStudyYearHome(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @RequestParam(name = "include_archived", required = false, defaultValue = "false") boolean includeArchived
    ) {
        StudyYearHomeResponseDto studyYear = studyYearService.getStudyYearHome(communitySlug, studyYearName, includeArchived);
        return ResponseEntity.ok(studyYear);
    }

    @GetMapping("/{studyYearName}/courses")
    public ResponseEntity<List<CourseIdentifiersResponseDto>> getStudyYearCourses(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName
            ) {
        List<CourseIdentifiersResponseDto> courses = studyYearService.getStudyYearCourses(communitySlug, studyYearName);
        return ResponseEntity.ok(courses);
    }
}
