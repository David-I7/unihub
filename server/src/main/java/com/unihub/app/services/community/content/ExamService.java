package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.ExamResponseDto;
import com.unihub.app.entities.community.content.Exam;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.ResourceContentMapper;
import com.unihub.app.repositories.community.content.ExamRepository;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseService courseService;
    private final ResourceContentMapper resourceContentMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<ExamResponseDto> getExamsByCourse(
            String communitySlug,
            StudyYearName studyYearName,
            int courseId,
            Pageable pageable
    ) {
        courseService.verifyCourseExists(communitySlug, studyYearName, courseId);

        Page<Exam> examPage = examRepository.findByCourseId(courseId, pageable);
        return pageMapper.toPageDto(examPage.map(resourceContentMapper::toExamDto));
    }
}
