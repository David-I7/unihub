package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.resources.CourseSummaryDto;
import com.unihub.app.dto.community.resources.StudyYearDetailResponseDto;
import com.unihub.app.dto.community.resources.StudyYearSummaryDto;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyYearService {

    private final StudyYearRepository studyYearRepository;
    private final CourseRepository courseRepository;
    private final CommunityResourceMapper communityMapper;

    @Transactional(readOnly = true)
    public StudyYearDetailResponseDto getStudyYearDetail(String communitySlug, StudyYearName studyYearName, boolean includeArchived) {
        StudyYear studyYear = studyYearRepository.findByCommunitySlugAndStudyYearName(communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        List<Course> courses = includeArchived
                ? courseRepository.findAllByStudyYearIdWithTeachers(studyYear.getId())
                : courseRepository.findActiveByStudyYearIdWithTeachers(studyYear.getId());

        List<CourseSummaryDto> summaryDtos = courses.stream()
                .map(communityMapper::toCourseSummaryDto)
                .toList();

        return communityMapper.toStudyYearDetailResponseDto(studyYear, summaryDtos);
    }

    public List<StudyYearSummaryDto> getStudyYearSummary(String communitySlug) {
        return studyYearRepository.findSummariesByCommunitySlug(communitySlug);
    }
}
