package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.AssignmentResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Assignment;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.ResourceContentMapper;
import com.unihub.app.repositories.community.content.AssignmentRepository;
import com.unihub.app.services.community.content.AssignmentService;
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
public class AssignmentServiceTests {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private CourseService courseService;

    @Spy
    private ResourceContentMapper resourceContentMapper = new ResourceContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private AssignmentService assignmentService;

    @Test
    @DisplayName("getAssignmentsByCourse returns paginated assignments with owner and dueDate")
    public void testGetAssignmentsByCourse_Success() {
        UUID assignmentId = UUID.randomUUID();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime dueDate = now.plusDays(14);

        Resource resource = Resource.builder()
                .id(assignmentId)
                .title("Proiect MIPS")
                .description("Proiect semestru")
                .type(ResourceType.ASSIGNMENT)
                .owner(owner)
                .createdAt(now)
                .build();

        Assignment assignment = Assignment.builder()
                .id(assignmentId)
                .resource(resource)
                .dueDate(dueDate)
                .estimatedDurationMinutes(300)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(assignmentRepository.findByCourseId(1, pageRequest))
                .thenReturn(new PageImpl<>(List.of(assignment), pageRequest, 1));

        PageDto<AssignmentResponseDto> result = assignmentService.getAssignmentsByCourse(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                1,
                pageRequest
        );

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        AssignmentResponseDto dto = result.content().get(0);
        assertEquals(assignmentId, dto.id());
        assertEquals("Proiect MIPS", dto.title());
        assertEquals("Proiect semestru", dto.description());
        assertEquals(dueDate, dto.dueDate());
        assertEquals(300, dto.estimatedDurationMinutes());
        assertNotNull(dto.owner());
        assertEquals("david", dto.owner().username());

        verify(courseService).verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, 1);
        verify(assignmentRepository).findByCourseId(1, pageRequest);
    }
}
