package com.unihub.app.services.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.response.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final CommunityRepository communityRepository;
    private final CommunityResourceMapper communityMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public StudyYearHomeResponseDto getStudyYearHome(
            String communitySlug,
            StudyYearName studyYearName,
            String search,
            Integer semester,
            Boolean archived,
            Pageable pageable
    ) {
        StudyYear studyYear = studyYearRepository.findByCommunitySlugAndStudyYearName(communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Course> coursesPage = courseRepository.findAllByStudyYearIdWithFilters(
                studyYear.getId(),
                semester,
                archived,
                normalizedSearch,
                pageable
        );

        PageDto<CourseCardResponseDto> coursePageDto = pageMapper.toPageDto(
                coursesPage.map(communityMapper::toCourseCardResponseDto)
        );

        return communityMapper.toStudyYearHomeResponseDto(studyYear, coursePageDto);
    }

    public List<StudyYearMetricsResponseDto> getCommunityStudyYearMetrics(String communitySlug) {
        return studyYearRepository.findStudyYearMetricsByCommunitySlug(communitySlug);
    }

    public List<StudyYearIdentifiersResponseDto> getCommunityStudyYearIdentifiers(String communitySlug) {
        return studyYearRepository.findStudyYearIdentifiersByCommunitySlug(communitySlug);
    }

    public List<CourseIdentifiersResponseDto> getStudyYearCourses(String communitySlug, StudyYearName studyYearName){
        StudyYear studyYear = studyYearRepository.findByCommunitySlugAndStudyYearNameWithCourses(communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        return studyYear.getCourses().stream().map(communityMapper::courseIdentifiersResponseDto).toList();
    }

    @Transactional
    public StudyYearResponseDto createStudyYear(String communitySlug, CreateStudyYearRequestDto dto) {
        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (studyYearRepository.existsByCommunitySlugAndStudyYearName(communitySlug, dto.studyYearName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Study year already exists in this community");
        }

        StudyYear studyYear = communityMapper.toStudyYearEntity(dto, community);
        StudyYear saved = studyYearRepository.save(studyYear);
        return communityMapper.toStudyYearResponseDto(saved);
    }

    @Transactional
    public void deleteStudyYear(String communitySlug, StudyYearName studyYearName) {
        StudyYear studyYear = studyYearRepository.findByCommunitySlugAndStudyYearName(communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        studyYearRepository.delete(studyYear);
    }
}
