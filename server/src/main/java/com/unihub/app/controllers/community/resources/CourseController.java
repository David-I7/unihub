package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.AssignmentResponseDto;
import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.ExamResponseDto;
import com.unihub.app.dto.community.content.LectureResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.content.AssignmentService;
import com.unihub.app.services.community.content.ExamService;
import com.unihub.app.services.community.content.LectureService;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years/{studyYearName}/courses/{courseId}")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final ExamService examService;
    private final LectureService lectureService;
    private final AssignmentService assignmentService;

    @GetMapping("/materials")
    public ResponseEntity<CourseMaterialsResponseDto> getMaterials(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable int courseId,
            @RequestParam(required = false) UUID folderId
    ) {
        CourseMaterialsResponseDto materials = courseService.getMaterials(communitySlug, studyYearName, courseId, folderId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/exams")
    public ResponseEntity<PageDto<ExamResponseDto>> getExams(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable int courseId,
            @PageableDefault(sort = "resource.createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<ExamResponseDto> exams = examService.getExamsByCourse(communitySlug, studyYearName, courseId, pageable);
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/lectures")
    public ResponseEntity<PageDto<LectureResponseDto>> getLectures(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable int courseId,
            @PageableDefault(sort = "resource.createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<LectureResponseDto> lectures = lectureService.getLecturesByCourse(communitySlug, studyYearName, courseId, pageable);
        return ResponseEntity.ok(lectures);
    }

    @GetMapping("/assignments")
    public ResponseEntity<PageDto<AssignmentResponseDto>> getAssignments(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable int courseId,
            @PageableDefault(sort = "resource.createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<AssignmentResponseDto> assignments = assignmentService.getAssignmentsByCourse(communitySlug, studyYearName, courseId, pageable);
        return ResponseEntity.ok(assignments);
    }
}
