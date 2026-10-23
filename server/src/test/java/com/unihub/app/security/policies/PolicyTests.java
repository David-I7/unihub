package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.entities.community.resources.TeacherRating;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class PolicyTests {

    private CommunityAccessHelper helper;
    private UserDto user;
    private UUID userId;

    @BeforeEach
    public void setUp() {
        helper = mock(CommunityAccessHelper.class);
        userId = UUID.randomUUID();
        user = new UserDto(userId, "test@gmail.com", "testuser", true, RoleType.USER);
    }

    @Test
    @DisplayName("PostPolicy distinguishes author delete from moderator delete")
    public void testPostPolicy() {
        PostPolicy policy = new PostPolicy(helper);

        Community community = Community.builder().slug("fmi").build();
        CommunityPost communityPost = CommunityPost.builder().community(community).build();
        User author = User.builder().id(userId).build();
        Post post = Post.builder()
                .id(UUID.randomUUID())
                .owner(author)
                .channel(CommunicationChannel.COMMUNITY)
                .communityPost(communityPost)
                .build();

        assertThat(policy.can(user, post, PermissionType.DELETE_POST)).isTrue();
        policy.check(user, post, PermissionType.DELETE_POST);

        // When caller is not author
        User otherUser = User.builder().id(UUID.randomUUID()).build();
        post.setOwner(otherUser);

        when(helper.hasCommunityPermission("fmi", userId, PermissionType.MODERATE_POST)).thenReturn(true);
        assertThat(policy.can(user, post, PermissionType.DELETE_POST)).isTrue();

        when(helper.hasCommunityPermission("fmi", userId, PermissionType.MODERATE_POST)).thenReturn(false);
        assertThat(policy.can(user, post, PermissionType.DELETE_POST)).isFalse();
        assertThatThrownBy(() -> policy.check(user, post, PermissionType.DELETE_POST))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("CommentPolicy checks author vs moderator delete")
    public void testCommentPolicy() {
        CommentPolicy policy = new CommentPolicy(helper);

        Community community = Community.builder().slug("fmi").build();
        CommunityPost communityPost = CommunityPost.builder().community(community).build();
        Post post = Post.builder()
                .id(UUID.randomUUID())
                .channel(CommunicationChannel.COMMUNITY)
                .communityPost(communityPost)
                .build();

        User author = User.builder().id(userId).build();
        Comment comment = Comment.builder().id(UUID.randomUUID()).owner(author).post(post).build();

        assertThat(policy.can(user, comment, PermissionType.DELETE_COMMENT)).isTrue();

        // Not author
        User otherUser = User.builder().id(UUID.randomUUID()).build();
        comment.setOwner(otherUser);

        when(helper.hasCommunityPermission("fmi", userId, PermissionType.MODERATE_COMMENT)).thenReturn(true);
        assertThat(policy.can(user, comment, PermissionType.DELETE_COMMENT)).isTrue();

        when(helper.hasCommunityPermission("fmi", userId, PermissionType.MODERATE_COMMENT)).thenReturn(false);
        assertThat(policy.can(user, comment, PermissionType.DELETE_COMMENT)).isFalse();
        assertThatThrownBy(() -> policy.check(user, comment, PermissionType.DELETE_COMMENT))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("FolderPolicy check throws AccessDeniedException when denied")
    public void testFolderPolicy_CheckThrows() {
        FolderPolicy policy = new FolderPolicy(helper);

        Community community = Community.builder().slug("cs").build();
        StudyYear studyYear = StudyYear.builder().community(community).build();
        Course course = Course.builder().studyYear(studyYear).build();
        User otherOwner = User.builder().id(UUID.randomUUID()).build();
        Folder folder = Folder.builder().course(course).owner(otherOwner).build();

        when(helper.hasGlobalPermission(user, PermissionType.UPDATE_FOLDER)).thenReturn(false);

        assertThat(policy.can(user, folder, PermissionType.UPDATE_FOLDER)).isFalse();
        assertThatThrownBy(() -> policy.check(user, folder, PermissionType.UPDATE_FOLDER))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("MaterialPolicy checks owner and moderator permissions")
    public void testMaterialPolicy() {
        MaterialPolicy policy = new MaterialPolicy(helper);

        Community community = Community.builder().slug("cs").build();
        StudyYear studyYear = StudyYear.builder().community(community).build();
        Course course = Course.builder().studyYear(studyYear).build();
        User author = User.builder().id(userId).build();
        Resource material = MaterialLink.builder().course(course).owner(author).build();

        assertThat(policy.can(user, material, PermissionType.UPDATE_MATERIAL)).isTrue();
        policy.check(user, material, PermissionType.UPDATE_MATERIAL);

        User otherOwner = User.builder().id(UUID.randomUUID()).build();
        material.setOwner(otherOwner);

        when(helper.hasCommunityPermission("cs", userId, PermissionType.MODERATE_MATERIAL)).thenReturn(true);
        assertThat(policy.can(user, material, PermissionType.DELETE_MATERIAL)).isTrue();

        when(helper.hasCommunityPermission("cs", userId, PermissionType.MODERATE_MATERIAL)).thenReturn(false);
        assertThat(policy.can(user, material, PermissionType.DELETE_MATERIAL)).isFalse();
        assertThatThrownBy(() -> policy.check(user, material, PermissionType.DELETE_MATERIAL))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("TeacherPolicy can and check work with domain entity")
    public void testTeacherPolicy() {
        TeacherPolicy policy = new TeacherPolicy(helper);

        Community community = Community.builder().slug("cs").build();
        Teacher teacher = Teacher.builder().community(community).build();

        when(helper.hasCommunityPermission("cs", userId, PermissionType.DELETE_TEACHER)).thenReturn(true);
        assertThat(policy.can(user, teacher, PermissionType.DELETE_TEACHER)).isTrue();
        policy.check(user, teacher, PermissionType.DELETE_TEACHER);

        when(helper.hasCommunityPermission("cs", userId, PermissionType.DELETE_TEACHER)).thenReturn(false);
        assertThat(policy.can(user, teacher, PermissionType.DELETE_TEACHER)).isFalse();
        assertThatThrownBy(() -> policy.check(user, teacher, PermissionType.DELETE_TEACHER))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("TeacherRatingPolicy can and check work with domain entity")
    public void testTeacherRatingPolicy() {
        TeacherRatingPolicy policy = new TeacherRatingPolicy(helper);

        Community community = Community.builder().slug("cs").build();
        Teacher teacher = Teacher.builder().community(community).build();
        User author = User.builder().id(userId).build();
        TeacherRating rating = TeacherRating.builder().teacher(teacher).user(author).build();

        assertThat(policy.can(user, rating, PermissionType.UPDATE_TEACHER_RATING)).isTrue();
        policy.check(user, rating, PermissionType.UPDATE_TEACHER_RATING);

        User otherOwner = User.builder().id(UUID.randomUUID()).build();
        rating.setUser(otherOwner);

        when(helper.hasCommunityPermission("cs", userId, PermissionType.MODERATE_TEACHER_RATING)).thenReturn(true);
        assertThat(policy.can(user, rating, PermissionType.DELETE_TEACHER_RATING)).isTrue();

        when(helper.hasCommunityPermission("cs", userId, PermissionType.MODERATE_TEACHER_RATING)).thenReturn(false);
        assertThat(policy.can(user, rating, PermissionType.DELETE_TEACHER_RATING)).isFalse();
        assertThatThrownBy(() -> policy.check(user, rating, PermissionType.DELETE_TEACHER_RATING))
                .isInstanceOf(AccessDeniedException.class);
    }
}
