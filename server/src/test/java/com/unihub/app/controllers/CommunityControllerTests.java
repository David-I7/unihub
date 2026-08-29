package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.JoinCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CommunityPostService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import com.unihub.app.services.community.resources.CommunityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class CommunityControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/communities";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CommunityService communityService;

    @MockitoBean
    private CommunityMemberService communityMemberService;

    @MockitoBean
    private CommunityPostService communityPostService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
        when(authorizationService.hasGlobalPermission(any())).thenReturn(true);
        when(authorizationService.hasCommunityPermission(any(), any(), any())).thenReturn(true);
    }

    // =========================================================================
    // GET /api/v1/communities
    // =========================================================================

    @Test
    @DisplayName("""
            Given: communities exist in database
            When: GET /api/v1/communities is called
            Then: 200 OK is returned with paginated community list and non-null fields
            """)
    public void testGetCommunities_Success() throws Exception {
        UUID communityId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        CommunityResponseDto communityDto = CommunityResponseDto.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Community description")
                .memberCount(42)
                .verified(true)
                .backgroundColor("#2563eb")
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david",true))
                .build();

        PageDto<CommunityResponseDto> pageDto = PageDto.<CommunityResponseDto>builder()
                .content(List.of(communityDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(communityService.findAll(any(Pageable.class))).thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(communityId.toString()))
                .andExpect(jsonPath("$.content[0].name").value("FMI - Informatica ID"))
                .andExpect(jsonPath("$.content[0].slug").value("fmi-info-id"))
                .andExpect(jsonPath("$.content[0].description").value("Community description"))
                .andExpect(jsonPath("$.content[0].memberCount").value(42))
                .andExpect(jsonPath("$.content[0].backgroundColor").value("#2563eb"))
                .andExpect(jsonPath("$.content[0].verified").value(true))
                .andExpect(jsonPath("$.content[0].owner.id").value(ownerId.toString()))
                .andExpect(jsonPath("$.content[0].owner.username").value("david"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // =========================================================================
    // POST /api/v1/communities
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid create community request
            When: POST /api/v1/communities is called
            Then: 201 Created is returned with created community
            """)
    public void testCreateCommunity_Success() throws Exception {
        UUID communityId = UUID.randomUUID();
        CreateCommunityRequestDto requestDto = new CreateCommunityRequestDto(
                "FMI Info",
                "fmi-info",
                "New community description",
                "#2563eb"
        );

        CommunityResponseDto responseDto = CommunityResponseDto.builder()
                .id(communityId)
                .name("FMI Info")
                .slug("fmi-info")
                .description("New community description")
                .memberCount(1)
                .verified(false)
                .backgroundColor("#2563eb")
                .createdAt(OffsetDateTime.now())
                .owner(new OwnerDto(userId, "david", true))
                .build();

        when(communityService.createCommunity(eq(userDto), any(CreateCommunityRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(communityId.toString()))
                .andExpect(jsonPath("$.name").value("FMI Info"))
                .andExpect(jsonPath("$.slug").value("fmi-info"));
    }

    // =========================================================================
    // POST /api/v1/communities/join
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid join code
            When: POST /api/v1/communities/join is called
            Then: 201 Created is returned with enrolled community dto
            """)
    public void testJoinCommunityWithCode_Success() throws Exception {
        UUID commId = UUID.randomUUID();
        JoinCommunityRequestDto requestDto = new JoinCommunityRequestDto("ABC12345");

        UserEnrolledCommunityDto responseDto = UserEnrolledCommunityDto.builder()
                .id(commId)
                .name("FMI - Info")
                .slug("fmi-info")
                .role(RoleType.COMMUNITY_MEMBER.name())
                .joinedAt(OffsetDateTime.now())
                .build();

        when(communityMemberService.joinWithCode(eq(userDto), eq("ABC12345"))).thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(commId.toString()))
                .andExpect(jsonPath("$.slug").value("fmi-info"))
                .andExpect(jsonPath("$.role").value("COMMUNITY_MEMBER"));
    }

    // =========================================================================
    // GET /api/v1/communities/{communitySlug}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: community exists
            When: GET /api/v1/communities/{communitySlug} is called
            Then: 200 OK is returned with community response DTO
            """)
    public void testGetCommunityBySlug_Success() throws Exception {
        UUID communityId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        CommunityResponseDto responseDto = CommunityResponseDto.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Community description")
                .memberCount(100)
                .verified(true)
                .backgroundColor("#2563eb")
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david",true))
                .build();

        when(communityService.findBySlug("fmi-info-id")).thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(communityId.toString()))
                .andExpect(jsonPath("$.name").value("FMI - Informatica ID"))
                .andExpect(jsonPath("$.slug").value("fmi-info-id"))
                .andExpect(jsonPath("$.memberCount").value(100))
                .andExpect(jsonPath("$.verified").value(true));
    }

    @Test
    @DisplayName("""
            Given: non-existent community slug
            When: GET /api/v1/communities/{communitySlug} is called
            Then: 404 Not Found is returned
            """)
    public void testGetCommunityBySlug_NotFound() throws Exception {
        when(communityService.findBySlug("unknown-slug"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        mockMvc.perform(get(BASE_URL + "/unknown-slug")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Community not found"));
    }

    // =========================================================================
    // PATCH /api/v1/communities/{communitySlug}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid update community request
            When: PATCH /api/v1/communities/{communitySlug} is called
            Then: 200 OK is returned with updated community
            """)
    public void testUpdateCommunity_Success() throws Exception {
        UpdateCommunityRequestDto requestDto = new UpdateCommunityRequestDto(
                "Updated Name",
                null,
                "Updated desc",
                "#10b981",
                null,
                null
        );

        CommunityResponseDto responseDto = CommunityResponseDto.builder()
                .id(UUID.randomUUID())
                .name("Updated Name")
                .slug("fmi-info-id")
                .description("Updated desc")
                .backgroundColor("#10b981")
                .memberCount(10)
                .verified(true)
                .createdAt(OffsetDateTime.now())
                .owner(new OwnerDto(userId, "david", true))
                .build();

        when(communityService.updateCommunity(eq("fmi-info-id"), eq(userId), any(UpdateCommunityRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch(BASE_URL + "/fmi-info-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.backgroundColor").value("#10b981"));
    }

    // =========================================================================
    // DELETE /api/v1/communities/{communitySlug}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: existing community
            When: DELETE /api/v1/communities/{communitySlug} is called
            Then: 204 No Content is returned
            """)
    public void testDeleteCommunity_Success() throws Exception {
        doNothing().when(communityService).deleteCommunity("fmi-info-id", userId);

        mockMvc.perform(delete(BASE_URL + "/fmi-info-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(communityService).deleteCommunity("fmi-info-id", userId);
    }

    // =========================================================================
    // GET /api/v1/communities/{communitySlug}/study-years
    // =========================================================================

    @Test
    @DisplayName("""
            Given: community exists with study years
            When: GET /api/v1/communities/{communitySlug}/study-years is called
            Then: 200 OK is returned with study year identifiers
            """)
    public void testGetCommunityStudyYears_Success() throws Exception {
        List<StudyYearIdentifiersResponseDto> studyYears = List.of(
                new StudyYearIdentifiersResponseDto(1, StudyYearName.YEAR_1),
                new StudyYearIdentifiersResponseDto(2, StudyYearName.YEAR_2)
        );

        when(communityService.getCommunityStudyYears("fmi-info-id")).thenReturn(studyYears);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id/study-years")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].studyYearName").value("Year 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].studyYearName").value("Year 2"));
    }

    // =========================================================================
    // GET /api/v1/communities/{communitySlug}/home
    // =========================================================================

    @Test
    @DisplayName("""
            Given: community exists
            When: GET /api/v1/communities/{communitySlug}/home is called
            Then: 200 OK is returned with community home DTO
            """)
    public void testGetCommunityHome_Success() throws Exception {
        UUID communityId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        CommunityResponseDto communityDto = CommunityResponseDto.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Community description")
                .memberCount(42)
                .verified(true)
                .backgroundColor("#2563eb")
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david",true))
                .build();

        List<StudyYearMetricsResponseDto> studyYears = List.of(
                new StudyYearMetricsResponseDto(1, StudyYearName.YEAR_1, createdAt, 6, 0, 30),
                new StudyYearMetricsResponseDto(2, StudyYearName.YEAR_2, createdAt, 6, 0, 30)
        );

        CommunityHomeResponseDto response = CommunityHomeResponseDto.builder()
                .community(communityDto)
                .studyYears(studyYears)
                .build();

        when(communityService.getCommunityHome("fmi-info-id")).thenReturn(response);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.community.id").value(communityId.toString()))
                .andExpect(jsonPath("$.community.slug").value("fmi-info-id"))
                .andExpect(jsonPath("$.studyYears[0].id").value(1))
                .andExpect(jsonPath("$.studyYears[0].coursesCount").value(6))
                .andExpect(jsonPath("$.studyYears[0].archivedCoursesCount").value(0))
                .andExpect(jsonPath("$.studyYears[0].creditsCount").value(30));
    }

    // =========================================================================
    // GET /api/v1/communities/{communitySlug}/posts
    // =========================================================================

    @Test
    @DisplayName("""
            Given: community exists with posts and comments
            When: GET /api/v1/communities/{communitySlug}/posts is called
            Then: 200 OK is returned with paginated posts containing their ordered comments and non-null fields
            """)
    public void testGetCommunityPosts_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        UUID postOwnerId = UUID.randomUUID();
        UUID commentOwnerId = UUID.randomUUID();
        OffsetDateTime postCreatedAt = OffsetDateTime.now().minusHours(2);
        OffsetDateTime postUpdatedAt = OffsetDateTime.now().minusHours(1);
        OffsetDateTime commentCreatedAt = OffsetDateTime.now().minusMinutes(30);
        OffsetDateTime commentUpdatedAt = OffsetDateTime.now().minusMinutes(30);

        CommentResponseDto commentDto = CommentResponseDto.builder()
                .id(commentId)
                .postId(postId)
                .content("First comment")
                .createdAt(commentCreatedAt)
                .updatedAt(commentUpdatedAt)
                .owner(new OwnerDto(commentOwnerId, "alice", true))
                .build();

        PostResponseDto postDto = PostResponseDto.builder()
                .id(postId)
                .title("Welcome to FMI")
                .description("Community discussion thread")
                .channel(CommunicationChannel.COMMUNITY)
                .pinned(true)
                .likesCount(10)
                .commentsCount(1)
                .createdAt(postCreatedAt)
                .updatedAt(postUpdatedAt)
                .owner(new OwnerDto(postOwnerId, "david", true))
                .comments(List.of(commentDto))
                .build();

        PageDto<PostResponseDto> pageDto = PageDto.<PostResponseDto>builder()
                .content(List.of(postDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(communityPostService.getCommunityPosts(eq("fmi-info-id"), any(), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id/posts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(postId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Welcome to FMI"))
                .andExpect(jsonPath("$.content[0].channel").value("COMMUNITY"))
                .andExpect(jsonPath("$.content[0].comments[0].content").value("First comment"));
    }

    @Test
    @DisplayName("""
            Given: non-existent community slug
            When: GET /api/v1/communities/{communitySlug}/posts is called
            Then: 404 Not Found is returned
            """)
    public void testGetCommunityPosts_NotFound() throws Exception {
        when(communityPostService.getCommunityPosts(eq("unknown-slug"), any(), any(Pageable.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        mockMvc.perform(get(BASE_URL + "/unknown-slug/posts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Community not found"));
    }

    @Test
    @DisplayName("""
            Given: valid post payload
            When: POST /api/v1/communities/{communitySlug}/posts is called
            Then: 201 Created is returned with PostResponseDto
            """)
    public void testCreateCommunityPost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        CreatePostRequestDto requestDto = new CreatePostRequestDto("Welcome Post", "Welcome description");
        PostResponseDto responseDto = PostResponseDto.builder()
                .id(postId)
                .title("Welcome Post")
                .description("Welcome description")
                .channel(CommunicationChannel.COMMUNITY)
                .likesCount(0)
                .commentsCount(0)
                .owner(new OwnerDto(userId, "david", true))
                .build();

        when(communityPostService.createCommunityPost(eq("fmi-info-id"), any(), any(CreatePostRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL + "/fmi-info-id/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(postId.toString()))
                .andExpect(jsonPath("$.title").value("Welcome Post"));
    }
}
