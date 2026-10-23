package com.unihub.app;

import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.repositories.community.resources.*;
import com.unihub.app.security.UnifiedPermissionEvaluator;
import com.unihub.app.services.community.content.*;
import com.unihub.app.services.community.resources.*;
import com.unihub.app.services.email.EmailService;
import com.unihub.app.services.storage.FileSystemFileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class BaseIntegrationTest {

    // Repositories
    @MockitoBean
    protected UserRepository userRepository;

    @MockitoBean
    protected SessionRepository sessionRepository;

    @MockitoBean
    protected UserIdentityRepository userIdentityRepository;

    @MockitoBean
    protected RoleRepository roleRepository;

    @MockitoBean
    protected PermissionRepository permissionRepository;

    @MockitoBean
    protected CommunityRepository communityRepository;

    @MockitoBean
    protected CommunityMemberRepository communityMemberRepository;

    @MockitoBean
    protected CommunityJoinCodeRepository communityJoinCodeRepository;

    @MockitoBean
    protected CourseRepository courseRepository;

    @MockitoBean
    protected StudyYearRepository studyYearRepository;

    @MockitoBean
    protected FolderRepository folderRepository;

    @MockitoBean
    protected ResourceRepository resourceRepository;

    @MockitoBean
    protected MaterialFileRepository materialFileRepository;

    @MockitoBean
    protected MaterialLinkRepository materialLinkRepository;

    @MockitoBean
    protected NotificationRepository notificationRepository;

    @MockitoBean
    protected EventRepository eventRepository;

    @MockitoBean
    protected EventReminderRepository eventReminderRepository;

    @MockitoBean
    protected TeacherRepository teacherRepository;

    @MockitoBean
    protected TeacherRatingRepository teacherRatingRepository;

    @MockitoBean
    protected TeacherRatingValueRepository teacherRatingValueRepository;

    @MockitoBean
    protected RatingMetricRepository ratingMetricRepository;

    @MockitoBean
    protected PostRepository postRepository;

    @MockitoBean
    protected CommentRepository commentRepository;

    @MockitoBean
    protected CommunityPostRepository communityPostRepository;

    @MockitoBean
    protected CoursePostRepository coursePostRepository;

    @MockitoBean
    protected PostLikeRepository postLikeRepository;

    // Services
    @MockitoBean
    protected EmailService emailService;

    @MockitoBean
    protected UnifiedPermissionEvaluator permissionEvaluator;

    @MockitoBean
    protected CalendarService calendarService;

    @MockitoBean
    protected CommentService commentService;

    @MockitoBean
    protected CommunityService communityService;

    @MockitoBean
    protected CommunityMemberService communityMemberService;

    @MockitoBean
    protected CommunityPostService communityPostService;

    @MockitoBean
    protected CommunityJoinCodeService communityJoinCodeService;

    @MockitoBean
    protected CourseService courseService;

    @MockitoBean
    protected CoursePostService coursePostService;

    @MockitoBean
    protected FolderService folderService;

    @MockitoBean
    protected MaterialFileService materialFileService;

    @MockitoBean
    protected MaterialLinkService materialLinkService;

    @MockitoBean
    protected FileSystemFileStorageService fileSystemFileStorageService;

    @MockitoBean
    protected ResourceService resourceService;

    @MockitoBean
    protected NotificationService notificationService;

    @MockitoBean
    protected PostService postService;

    @MockitoBean
    protected StudyYearService studyYearService;

    @MockitoBean
    protected TeacherService teacherService;

    @MockitoBean
    protected TeacherRatingService teacherRatingService;

    @BeforeEach
    public void setupBaseSecurity() {
        when(permissionEvaluator.hasPermission(any(), any(), any())).thenReturn(true);
        when(permissionEvaluator.hasPermission(any(), any(), any(), any())).thenReturn(true);
    }
}
