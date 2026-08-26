package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.ExamResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Exam;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.community.content.ExamRepository;
import com.unihub.app.services.community.content.ExamService;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExamServiceTests {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private CourseService courseService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private ExamService examService;

    @Test
    @DisplayName("getExamsByCourse returns paginated exams with owner and details")
    public void testGetExamsByCourse_Success() {
        UUID examId = UUID.randomUUID();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime scheduledDate = now.plusDays(30);
        com.unihub.app.entities.community.resources.Course course = com.unihub.app.entities.community.resources.Course.builder()
                .id(1L)
                .slug("asc")
                .build();

        Resource resource = Resource.builder()
                .id(examId)
                .title("Examen scris")
                .description("Examen sesiune")
                .type(ResourceType.EXAM)
                .owner(owner)
                .createdAt(now)
                .build();

        Exam exam = Exam.builder()
                .id(examId)
                .resource(resource)
                .scheduledDate(scheduledDate)
                .estimatedDurationMinutes(120)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(courseService.verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(course);
        when(examRepository.findByCourseId(1L, pageRequest))
                .thenReturn(new PageImpl<>(List.of(exam), pageRequest, 1));

        PageDto<ExamResponseDto> result = examService.getExamsByCourse(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                "asc",
                pageRequest
        );

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        ExamResponseDto dto = result.content().get(0);
        assertEquals(examId, dto.id());
        assertEquals("Examen scris", dto.title());
        assertEquals("Examen sesiune", dto.description());
        assertEquals(scheduledDate, dto.scheduledDate());
        assertEquals(120, dto.estimatedDurationMinutes());
        assertNotNull(dto.owner());
        assertEquals("david", dto.owner().username());

        verify(courseService).verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc");
        verify(examRepository).findByCourseId(1L, pageRequest);
    }
}
