package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import com.unihub.app.services.globalResources.TeacherService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTests {

    @Mock
    private TeacherRepository teacherRepository;

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private TeacherService teacherService;

    @Test
    @DisplayName("findAll returns paginated teachers")
    public void testFindAll_Success() {
        UUID teacherId = UUID.randomUUID();
        Teacher teacher = Teacher.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.5f)
                .ratingsCount(10)
                .createdAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(teacherRepository.findAll(pageRequest))
                .thenReturn(new PageImpl<>(List.of(teacher), pageRequest, 1));

        PageDto<TeacherResponseDto> result = teacherService.findAll(pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());
        assertEquals(teacherId, result.content().get(0).id());
        assertEquals("Daniel", result.content().get(0).firstName());
    }
}
