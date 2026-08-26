package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.LectureResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Lecture;
import com.unihub.app.entities.community.content.LectureLocation;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.community.content.LectureRepository;
import com.unihub.app.services.community.content.LectureService;
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
public class LectureServiceTests {

    @Mock
    private LectureRepository lectureRepository;

    @Mock
    private CourseService courseService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private LectureService lectureService;

    @Test
    @DisplayName("getLecturesByCourse returns paginated lectures with owner and location")
    public void testGetLecturesByCourse_Success() {
        UUID lectureId = UUID.randomUUID();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = now.plusDays(2);
        OffsetDateTime endTime = startTime.plusHours(2);
        com.unihub.app.entities.community.resources.Course course = com.unihub.app.entities.community.resources.Course.builder()
                .id(1L)
                .slug("asc")
                .build();

        Resource resource = Resource.builder()
                .id(lectureId)
                .title("Curs 1 - Introducere")
                .description("Introductiv")
                .type(ResourceType.LECTURE)
                .owner(owner)
                .createdAt(now)
                .build();

        Lecture lecture = Lecture.builder()
                .id(lectureId)
                .resource(resource)
                .startTime(startTime)
                .endTime(endTime)
                .location(LectureLocation.ONLINE)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(courseService.verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(course);
        when(lectureRepository.findByCourseId(1L, pageRequest))
                .thenReturn(new PageImpl<>(List.of(lecture), pageRequest, 1));

        PageDto<LectureResponseDto> result = lectureService.getLecturesByCourse(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                "asc",
                pageRequest
        );

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        LectureResponseDto dto = result.content().get(0);
        assertEquals(lectureId, dto.id());
        assertEquals("Curs 1 - Introducere", dto.title());
        assertEquals("Introductiv", dto.description());
        assertEquals(startTime, dto.startTime());
        assertEquals(endTime, dto.endTime());
        assertEquals(LectureLocation.ONLINE, dto.location());
        assertNotNull(dto.owner());
        assertEquals("david", dto.owner().username());

        verify(courseService).verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc");
        verify(lectureRepository).findByCourseId(1L, pageRequest);
    }
}
