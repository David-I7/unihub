package com.unihub.app.config;

import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import com.unihub.app.repositories.community.resources.RatingMetricRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingValueRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MockRepositoriesTestConfig {

    @Bean
    public SessionRepository sessionRepository() {
        return Mockito.mock(SessionRepository.class);
    }

    @Bean
    public UserIdentityRepository userIdentityRepository() {
        return Mockito.mock(UserIdentityRepository.class);
    }

    @Bean
    public UserRepository userRepository() {
        return Mockito.mock(UserRepository.class);
    }

    @Bean
    public PermissionRepository permissionRepository() {
        return Mockito.mock(PermissionRepository.class);
    }

    @Bean
    public RoleRepository roleRepository() {
        return Mockito.mock(RoleRepository.class);
    }

    @Bean
    public CommentRepository commentRepository() {
        return Mockito.mock(CommentRepository.class);
    }

    @Bean
    public CommunityPostRepository communityPostRepository() {
        return Mockito.mock(CommunityPostRepository.class);
    }

    @Bean
    public CoursePostRepository coursePostRepository() {
        return Mockito.mock(CoursePostRepository.class);
    }

    @Bean
    public EventReminderRepository eventReminderRepository() {
        return Mockito.mock(EventReminderRepository.class);
    }

    @Bean
    public EventRepository eventRepository() {
        return Mockito.mock(EventRepository.class);
    }

    @Bean
    public FolderRepository folderRepository() {
        return Mockito.mock(FolderRepository.class);
    }

    @Bean
    public MaterialFileRepository materialFileRepository() {
        return Mockito.mock(MaterialFileRepository.class);
    }

    @Bean
    public MaterialLinkRepository materialLinkRepository() {
        return Mockito.mock(MaterialLinkRepository.class);
    }

    @Bean
    public NotificationRepository notificationRepository() {
        return Mockito.mock(NotificationRepository.class);
    }

    @Bean
    public PostRepository postRepository() {
        return Mockito.mock(PostRepository.class);
    }

    @Bean
    public PostLikeRepository postLikeRepository() {
        return Mockito.mock(PostLikeRepository.class);
    }

    @Bean
    public ResourceRepository resourceRepository() {
        return Mockito.mock(ResourceRepository.class);
    }

    @Bean
    public CommunityMemberRepository communityMemberRepository() {
        return Mockito.mock(CommunityMemberRepository.class);
    }

    @Bean
    public CommunityJoinCodeRepository communityJoinCodeRepository() {
        return Mockito.mock(CommunityJoinCodeRepository.class);
    }

    @Bean
    public CommunityRepository communityRepository() {
        return Mockito.mock(CommunityRepository.class);
    }

    @Bean
    public CourseRepository courseRepository() {
        return Mockito.mock(CourseRepository.class);
    }

    @Bean
    public StudyYearRepository studyYearRepository() {
        return Mockito.mock(StudyYearRepository.class);
    }

    @Bean
    public RatingMetricRepository ratingMetricRepository() {
        return Mockito.mock(RatingMetricRepository.class);
    }

    @Bean
    public TeacherRatingRepository teacherRatingRepository() {
        return Mockito.mock(TeacherRatingRepository.class);
    }

    @Bean
    public TeacherRatingValueRepository teacherRatingValueRepository() {
        return Mockito.mock(TeacherRatingValueRepository.class);
    }

    @Bean
    public TeacherRepository teacherRepository() {
        return Mockito.mock(TeacherRepository.class);
    }

    @Bean
    public org.springframework.mail.javamail.JavaMailSender javaMailSender() {
        org.springframework.mail.javamail.JavaMailSender sender = Mockito.mock(org.springframework.mail.javamail.JavaMailSender.class);
        Mockito.when(sender.createMimeMessage()).thenReturn(new jakarta.mail.internet.MimeMessage((jakarta.mail.Session) null));
        return sender;
    }
}
