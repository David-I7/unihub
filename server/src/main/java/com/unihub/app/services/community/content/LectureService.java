package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.LectureResponseDto;
import com.unihub.app.entities.community.content.Lecture;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.community.content.LectureRepository;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LectureService {

    private final LectureRepository lectureRepository;
    private final CourseService courseService;
    private final CommunityContentMapper contentMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<LectureResponseDto> getLecturesByCourse(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            Pageable pageable
    ) {
        Course course = courseService.verifyCourseExists(communitySlug, studyYearName, courseSlug);

        Page<Lecture> lecturePage = lectureRepository.findByCourseId(course.getId(), pageable);
        return pageMapper.toPageDto(lecturePage.map(contentMapper::toLectureResponseDto));
    }
}
