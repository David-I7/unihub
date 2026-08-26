package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.CourseTeachersResponseDto;
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

    @GetMapping("/teachers")
    public ResponseEntity<CourseTeachersResponseDto> getCourse(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug
    ){
        CourseTeachersResponseDto courseResponse = courseService.getCourseTeachers(communitySlug, studyYearName, courseSlug);
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
}
