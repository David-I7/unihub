package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherDetailResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherMetricRatingDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherResponseDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class TeacherControllerTests extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private TeacherService teacherService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
    }

    @Test
    @DisplayName("POST /api/v1/communities/{communitySlug}/teachers creates a teacher")
    public void testCreateTeacher_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        CreateTeacherRequestDto requestDto = CreateTeacherRequestDto.builder()
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .build();

        TeacherResponseDto responseDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .averageRating(0.0f)
                .ratingsCount(0)
                .createdAt(OffsetDateTime.now())
                .build();

        when(teacherService.createTeacher(eq("fmi-info-id"), any(UserDto.class), any(CreateTeacherRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/communities/fmi-info-id/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(teacherId.toString()))
                .andExpect(jsonPath("$.firstName").value("Daniel"))
                .andExpect(jsonPath("$.lastName").value("Dragulici"))
                .andExpect(jsonPath("$.estimatedAge").value(42));
    }

    @Test
    @DisplayName("GET /api/v1/communities/{communitySlug}/teachers returns paginated teachers")
    public void testGetCommunityTeachers_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        TeacherResponseDto teacherDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .averageRating(4.8f)
                .ratingsCount(15)
                .createdAt(OffsetDateTime.now())
                .build();

        PageDto<TeacherResponseDto> pageDto = PageDto.<TeacherResponseDto>builder()
                .content(List.of(teacherDto))
                .number(0)
                .size(20)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(teacherService.getPaginatedTeachers(eq("fmi-info-id"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get("/api/v1/communities/fmi-info-id/teachers?studyYear=YEAR_1&semester=1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(teacherId.toString()))
                .andExpect(jsonPath("$.content[0].firstName").value("Daniel"))
                .andExpect(jsonPath("$.content[0].lastName").value("Dragulici"))
                .andExpect(jsonPath("$.content[0].estimatedAge").value(42));
    }

    @Test
    @DisplayName("PATCH /api/v1/teachers/{teacherId} updates teacher")
    public void testUpdateTeacher_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        UpdateTeacherRequestDto requestDto = UpdateTeacherRequestDto.builder()
                .firstName("Dan")
                .estimatedAge(43)
                .build();

        TeacherResponseDto responseDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Dan")
                .lastName("Dragulici")
                .estimatedAge(43)
                .averageRating(4.8f)
                .ratingsCount(15)
                .createdAt(OffsetDateTime.now())
                .build();

        when(teacherService.updateTeacher(eq(teacherId), any(UserDto.class), any(UpdateTeacherRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/teachers/" + teacherId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacherId.toString()))
                .andExpect(jsonPath("$.firstName").value("Dan"))
                .andExpect(jsonPath("$.estimatedAge").value(43));
    }

    @Test
    @DisplayName("DELETE /api/v1/teachers/{teacherId} deletes teacher")
    public void testDeleteTeacher_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        doNothing().when(teacherService).deleteTeacher(eq(teacherId), any(UserDto.class));

        mockMvc.perform(delete("/api/v1/teachers/" + teacherId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/teachers/{teacherId} returns teacher detail")
    public void testGetTeacherDetail_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();

        TeacherMetricRatingDto metricDto = TeacherMetricRatingDto.builder()
                .metricId(1)
                .metricName("Teaching ability")
                .description("Delivery")
                .averageRating(4.8f)
                .ratingsCount(10)
                .build();

        TeacherDetailResponseDto detailDto = TeacherDetailResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .averageRating(4.8f)
                .ratingsCount(10)
                .createdAt(OffsetDateTime.now())
                .coursesTaught(Collections.emptyList())
                .detailedRatings(List.of(metricDto))
                .build();

        when(teacherService.getTeacherDetail(eq(teacherId)))
                .thenReturn(detailDto);

        mockMvc.perform(get("/api/v1/teachers/" + teacherId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacherId.toString()))
                .andExpect(jsonPath("$.firstName").value("Daniel"))
                .andExpect(jsonPath("$.estimatedAge").value(42))
                .andExpect(jsonPath("$.detailedRatings[0].metricName").value("Teaching ability"));
    }
}
