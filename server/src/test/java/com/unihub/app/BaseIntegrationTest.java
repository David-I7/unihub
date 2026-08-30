package com.unihub.app;

import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.repositories.community.resources.*;
import com.unihub.app.repositories.globalResources.RatingMetricRepository;
import com.unihub.app.repositories.globalResources.TeacherRatingRepository;
import com.unihub.app.repositories.globalResources.TeacherRatingValueRepository;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
public abstract class BaseIntegrationTest {

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
}
