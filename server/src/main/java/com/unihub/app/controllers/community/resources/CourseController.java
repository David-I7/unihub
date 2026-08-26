package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.resources.CourseResponseDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years/{studyYearName}/courses/{courseSlug}")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<CourseResponseDto> getCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ){
        CourseResponseDto courseResponse = courseService.findBySlug(communitySlug, studyYearName, courseSlug);
        return ResponseEntity.ok(courseResponse);
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponseDto>> getCourseTeachers(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ){
        List<TeacherResponseDto> teachers = courseService.findCourseTeachers(communitySlug, studyYearName, courseSlug);
        return ResponseEntity.ok(teachers);
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
}
