package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.community.resources.CommunityController;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityStudyYearsResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtSessionManagementFilter;
import com.unihub.app.security.OAuth2AuthenticationFailureHandler;
import com.unihub.app.security.OAuth2AuthenticationSuccessHandler;
import com.unihub.app.security.OAuth2ProviderUserInfoExtractor;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.content.CommunityPostService;
import com.unihub.app.services.community.resources.CommunityService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CommunityControllerTests {

    private static final String BASE_URL = "/api/v1/communities";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommunityService communityService;

    @MockitoBean
    private CommunityPostService communityPostService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @MockitoBean
    private PermissionRepository permissionRepository;

    @MockitoBean
    private CommunityMemberRepository communityMemberRepository;

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
                .owner(new OwnerDto(ownerId, "david"))
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
                .andExpect(jsonPath("$.content[0].createdAt").exists())
                .andExpect(jsonPath("$.content[0].owner.id").value(ownerId.toString()))
                .andExpect(jsonPath("$.content[0].owner.username").value("david"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
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
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        when(communityService.findBySlug("fmi-info-id")).thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(communityId.toString()))
                .andExpect(jsonPath("$.name").value("FMI - Informatica ID"))
                .andExpect(jsonPath("$.slug").value("fmi-info-id"))
                .andExpect(jsonPath("$.description").value("Community description"))
                .andExpect(jsonPath("$.memberCount").value(100))
                .andExpect(jsonPath("$.backgroundColor").value("#2563eb"))
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.owner.id").value(ownerId.toString()))
                .andExpect(jsonPath("$.owner.username").value("david"));
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
    // GET /api/v1/communities/{communitySlug}/study-years
    // =========================================================================

    @Test
    @DisplayName("""
            Given: community exists with study years
            When: GET /api/v1/communities/{communitySlug}/study-years is called
            Then: 200 OK is returned with community details and study year summaries
            """)
    public void testGetCommunityStudyYears_Success() throws Exception {
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
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        List<StudyYearResponseDto> studyYears = List.of(
                new StudyYearResponseDto(1, StudyYearName.YEAR_1, 6, 0, 30),
                new StudyYearResponseDto(2, StudyYearName.YEAR_2, 6, 0, 30),
                new StudyYearResponseDto(3, StudyYearName.YEAR_3, 5, 0, 30)
        );

        CommunityStudyYearsResponseDto response = CommunityStudyYearsResponseDto.builder()
                .community(communityDto)
                .studyYears(studyYears)
                .build();

        when(communityService.getCommunityStudyYears("fmi-info-id")).thenReturn(response);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id/study-years")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.community.id").value(communityId.toString()))
                .andExpect(jsonPath("$.community.name").value("FMI - Informatica ID"))
                .andExpect(jsonPath("$.community.slug").value("fmi-info-id"))
                .andExpect(jsonPath("$.community.description").value("Community description"))
                .andExpect(jsonPath("$.community.memberCount").value(42))
                .andExpect(jsonPath("$.community.backgroundColor").value("#2563eb"))
                .andExpect(jsonPath("$.community.verified").value(true))
                .andExpect(jsonPath("$.community.owner.id").value(ownerId.toString()))
                .andExpect(jsonPath("$.community.owner.username").value("david"))
                .andExpect(jsonPath("$.studyYears").isArray())
                .andExpect(jsonPath("$.studyYears.length()").value(3))
                .andExpect(jsonPath("$.studyYears[0].id").value(1))
                .andExpect(jsonPath("$.studyYears[0].studyYearName").value("Year 1"))
                .andExpect(jsonPath("$.studyYears[0].coursesCount").value(6))
                .andExpect(jsonPath("$.studyYears[0].archivedCoursesCount").value(0))
                .andExpect(jsonPath("$.studyYears[0].creditsCount").value(30))
                .andExpect(jsonPath("$.studyYears[1].id").value(2))
                .andExpect(jsonPath("$.studyYears[1].studyYearName").value("Year 2"))
                .andExpect(jsonPath("$.studyYears[1].coursesCount").value(6))
                .andExpect(jsonPath("$.studyYears[1].archivedCoursesCount").value(0))
                .andExpect(jsonPath("$.studyYears[1].creditsCount").value(30))
                .andExpect(jsonPath("$.studyYears[2].id").value(3))
                .andExpect(jsonPath("$.studyYears[2].studyYearName").value("Year 3"))
                .andExpect(jsonPath("$.studyYears[2].coursesCount").value(5))
                .andExpect(jsonPath("$.studyYears[2].archivedCoursesCount").value(0))
                .andExpect(jsonPath("$.studyYears[2].creditsCount").value(30));
    }

    @Test
    @DisplayName("""
            Given: non-existent community slug
            When: GET /api/v1/communities/{communitySlug}/study-years is called
            Then: 404 Not Found is returned
            """)
    public void testGetCommunityStudyYears_NotFound() throws Exception {
        when(communityService.getCommunityStudyYears("unknown-slug"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        mockMvc.perform(get(BASE_URL + "/unknown-slug/study-years")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Community not found"));
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
                .owner(new OwnerDto(commentOwnerId, "alice"))
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
                .owner(new OwnerDto(postOwnerId, "david"))
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

        when(communityPostService.getCommunityPosts(eq("fmi-info-id"), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/fmi-info-id/posts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(postId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Welcome to FMI"))
                .andExpect(jsonPath("$.content[0].description").value("Community discussion thread"))
                .andExpect(jsonPath("$.content[0].channel").value("COMMUNITY"))
                .andExpect(jsonPath("$.content[0].pinned").value(true))
                .andExpect(jsonPath("$.content[0].likesCount").value(10))
                .andExpect(jsonPath("$.content[0].commentsCount").value(1))
                .andExpect(jsonPath("$.content[0].createdAt").exists())
                .andExpect(jsonPath("$.content[0].updatedAt").exists())
                .andExpect(jsonPath("$.content[0].owner.id").value(postOwnerId.toString()))
                .andExpect(jsonPath("$.content[0].owner.username").value("david"))
                .andExpect(jsonPath("$.content[0].comments").isArray())
                .andExpect(jsonPath("$.content[0].comments[0].id").value(commentId.toString()))
                .andExpect(jsonPath("$.content[0].comments[0].postId").value(postId.toString()))
                .andExpect(jsonPath("$.content[0].comments[0].content").value("First comment"))
                .andExpect(jsonPath("$.content[0].comments[0].createdAt").exists())
                .andExpect(jsonPath("$.content[0].comments[0].updatedAt").exists())
                .andExpect(jsonPath("$.content[0].comments[0].owner.id").value(commentOwnerId.toString()))
                .andExpect(jsonPath("$.content[0].comments[0].owner.username").value("alice"));
    }

    @Test
    @DisplayName("""
            Given: non-existent community slug
            When: GET /api/v1/communities/{communitySlug}/posts is called
            Then: 404 Not Found is returned
            """)
    public void testGetCommunityPosts_NotFound() throws Exception {
        when(communityPostService.getCommunityPosts(eq("unknown-slug"), any(Pageable.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        mockMvc.perform(get(BASE_URL + "/unknown-slug/posts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Community not found"));
    }
}
