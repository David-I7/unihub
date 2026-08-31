package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.request.RatingValueRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingValueResponseDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.TeacherRatingService;
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
public class TeacherRatingControllerTests extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private TeacherRatingService teacherRatingService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userDto = new UserDto(UUID.randomUUID(), "student@example.com", "student1", true, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
    }

    @Test
    @DisplayName("POST /api/v1/teachers/{teacherId}/ratings creates a rating review")
    public void testCreateRating_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        CreateTeacherRatingRequestDto request = CreateTeacherRatingRequestDto.builder()
                .title("Great teacher")
                .description("Engaging lectures and clear explanations")
                .isAnonymous(false)
                .values(List.of(
                        new RatingValueRequestDto(1, 5),
                        new RatingValueRequestDto(2, 4)
                ))
                .build();

        TeacherRatingResponseDto responseDto = TeacherRatingResponseDto.builder()
                .id(100L)
                .title("Great teacher")
                .description("Engaging lectures and clear explanations")
                .createdAt(OffsetDateTime.now())
                .isAnonymous(false)
                .author(new OwnerDto(userDto.id(), userDto.username(), true))
                .values(List.of(
                        new TeacherRatingValueResponseDto(1, "Clarity", 5),
                        new TeacherRatingValueResponseDto(2, "Helpfulness", 4)
                ))
                .build();

        when(teacherRatingService.createRating(eq(teacherId), any(UserDto.class), any(CreateTeacherRatingRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/teachers/" + teacherId + "/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Great teacher"))
                .andExpect(jsonPath("$.description").value("Engaging lectures and clear explanations"))
                .andExpect(jsonPath("$.isAnonymous").value(false))
                .andExpect(jsonPath("$.author.username").value("student1"))
                .andExpect(jsonPath("$.values[0].metricId").value(1))
                .andExpect(jsonPath("$.values[0].value").value(5));
    }

    @Test
    @DisplayName("POST /api/v1/teachers/{teacherId}/ratings returns 400 when title is blank")
    public void testCreateRating_InvalidBody_BadRequest() throws Exception {
        UUID teacherId = UUID.randomUUID();
        CreateTeacherRatingRequestDto request = CreateTeacherRatingRequestDto.builder()
                .title("")
                .values(List.of(new RatingValueRequestDto(1, 5)))
                .build();

        mockMvc.perform(post("/api/v1/teachers/" + teacherId + "/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/teachers/{teacherId}/ratings/{ratingId} updates review")
    public void testUpdateRating_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        Long ratingId = 100L;

        UpdateTeacherRatingRequestDto request = UpdateTeacherRatingRequestDto.builder()
                .title("Updated Title")
                .description("Updated description after finals")
                .isAnonymous(true)
                .values(List.of(
                        new RatingValueRequestDto(1, 4),
                        new RatingValueRequestDto(2, 5)
                ))
                .build();

        TeacherRatingResponseDto responseDto = TeacherRatingResponseDto.builder()
                .id(ratingId)
                .title("Updated Title")
                .description("Updated description after finals")
                .createdAt(OffsetDateTime.now())
                .isAnonymous(true)
                .author(null)
                .values(List.of(
                        new TeacherRatingValueResponseDto(1, "Clarity", 4),
                        new TeacherRatingValueResponseDto(2, "Helpfulness", 5)
                ))
                .build();

        when(teacherRatingService.updateRating(eq(teacherId), eq(ratingId), any(UserDto.class), any(UpdateTeacherRatingRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(put("/api/v1/teachers/" + teacherId + "/ratings/" + ratingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.isAnonymous").value(true))
                .andExpect(jsonPath("$.values[0].value").value(4));
    }

    @Test
    @DisplayName("DELETE /api/v1/teachers/{teacherId}/ratings/{ratingId} deletes review")
    public void testDeleteRating_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        Long ratingId = 100L;

        doNothing().when(teacherRatingService).deleteRating(eq(teacherId), eq(ratingId), any(UserDto.class));

        mockMvc.perform(delete("/api/v1/teachers/" + teacherId + "/ratings/" + ratingId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/teachers/{teacherId}/ratings returns paginated reviews")
    public void testGetTeacherRatings_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        TeacherRatingResponseDto ratingDto = TeacherRatingResponseDto.builder()
                .id(100L)
                .title("Great teacher")
                .description("Engaging lectures")
                .createdAt(OffsetDateTime.now())
                .isAnonymous(false)
                .author(new OwnerDto(userDto.id(), userDto.username(), true))
                .values(List.of(new TeacherRatingValueResponseDto(1, "Clarity", 5)))
                .build();

        PageDto<TeacherRatingResponseDto> pageDto = PageDto.<TeacherRatingResponseDto>builder()
                .content(List.of(ratingDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(teacherRatingService.getPaginatedRatings(eq(teacherId), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get("/api/v1/teachers/" + teacherId + "/ratings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(100))
                .andExpect(jsonPath("$.content[0].title").value("Great teacher"));
    }
}
