package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.community.resources.StudyYearDetailResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.resources.StudyYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}/study-years")
@RequiredArgsConstructor
public class StudyYearController {

    private final StudyYearService studyYearService;

    @GetMapping("/{studyYearName}")
    public ResponseEntity<StudyYearDetailResponseDto> getStudyYearCourses(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @RequestParam(name = "include_archived", required = false, defaultValue = "false") boolean includeArchived
    ) {
        StudyYearDetailResponseDto studyYear = studyYearService.getStudyYearDetail(communitySlug, studyYearName, includeArchived);
        return ResponseEntity.ok(studyYear);
    }
}
