package com.unihub.app.services;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Notification;
import com.unihub.app.entities.community.content.NotificationType;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.events.notification.*;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.community.content.NotificationEventListener;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationEventListenerTests {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private NotificationEventListener listener;

    @Test
    @DisplayName("handleCommunityPostCreated notifies all other members of the community")
    public void testHandleCommunityPostCreated() {
        UUID communityId = UUID.randomUUID();
        Community community = Community.builder().id(communityId).name("FMI Community").slug("fmi").build();

        User author = User.builder().id(UUID.randomUUID()).username("author").build();
        User member1 = User.builder().id(UUID.randomUUID()).username("member1").build();
        User member2 = User.builder().id(UUID.randomUUID()).username("member2").build();

        Post post = Post.builder().id(UUID.randomUUID()).title("Exam Prep").owner(author).build();

        when(communityMemberRepository.findMembersByCommunityIdExcludingUser(communityId, author.getId()))
                .thenReturn(List.of(member1, member2));

        listener.handleCommunityPostCreated(new CommunityPostCreatedNotificationEvent(post, community, author));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> savedList = captor.getValue();
        assertEquals(2, savedList.size());
        assertEquals(NotificationType.COMMUNITY_POST, savedList.get(0).getType());
        assertEquals("New post in FMI Community", savedList.get(0).getTitle());
        assertEquals("fmi", savedList.get(0).getMetadata().communitySlug());
        assertEquals("FMI Community", savedList.get(0).getMetadata().communityName());
        assertEquals("author", savedList.get(0).getActor().getUsername());
    }

    @Test
    @DisplayName("handleCommentCreated notifies the post owner when commenter is someone else")
    public void testHandleCommentCreated() {
        User postOwner = User.builder().id(UUID.randomUUID()).username("postOwner").build();
        User commenter = User.builder().id(UUID.randomUUID()).username("commenter").build();

        Post post = Post.builder().id(UUID.randomUUID()).title("Important Notice").owner(postOwner).build();
        Comment comment = Comment.builder().id(UUID.randomUUID()).content("Thanks for sharing!").build();

        listener.handleCommentCreated(new CommentCreatedNotificationEvent(comment, post, commenter));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(postOwner, saved.getUser());
        assertEquals(NotificationType.POST_COMMENT, saved.getType());
        assertEquals("New comment on your post", saved.getTitle());
    }

    @Test
    @DisplayName("handleCommentCreated does not notify when commenter is post owner")
    public void testHandleCommentCreated_SelfComment_NoNotification() {
        User postOwner = User.builder().id(UUID.randomUUID()).username("postOwner").build();

        Post post = Post.builder().id(UUID.randomUUID()).title("Important Notice").owner(postOwner).build();
        Comment comment = Comment.builder().id(UUID.randomUUID()).content("Self reply").build();

        listener.handleCommentCreated(new CommentCreatedNotificationEvent(comment, post, postOwner));

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("handlePostLiked notifies the post owner when liker is someone else")
    public void testHandlePostLiked() {
        User postOwner = User.builder().id(UUID.randomUUID()).username("postOwner").build();
        User liker = User.builder().id(UUID.randomUUID()).username("liker").build();

        Post post = Post.builder().id(UUID.randomUUID()).title("Helpful Material").owner(postOwner).build();

        listener.handlePostLiked(new PostLikedNotificationEvent(post, liker));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(postOwner, saved.getUser());
        assertEquals(NotificationType.POST_LIKE, saved.getType());
        assertEquals("New like on your post", saved.getTitle());
    }

    @Test
    @DisplayName("handleEventUpdated notifies users who set reminders")
    public void testHandleEventUpdated() {
        UUID recipientId = UUID.randomUUID();
        User recipient = User.builder().id(recipientId).username("student").build();
        User updater = User.builder().id(UUID.randomUUID()).username("prof").build();

        Event event = Event.builder().id(UUID.randomUUID()).title("Calculus Exam").build();

        when(userRepository.findAllById(List.of(recipientId))).thenReturn(List.of(recipient));

        listener.handleEventUpdated(new EventUpdatedDomainNotificationEvent(event, updater, List.of(recipientId)));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertEquals(1, saved.size());
        assertEquals(NotificationType.EVENT_UPDATED, saved.get(0).getType());
        assertEquals("Event Updated: Calculus Exam", saved.get(0).getTitle());
    }

    @Test
    @DisplayName("handleEventCancelled notifies users who set reminders")
    public void testHandleEventCancelled() {
        UUID recipientId = UUID.randomUUID();
        User recipient = User.builder().id(recipientId).username("student").build();
        User canceller = User.builder().id(UUID.randomUUID()).username("prof").build();

        when(userRepository.findAllById(List.of(recipientId))).thenReturn(List.of(recipient));

        listener.handleEventCancelled(new EventCancelledDomainNotificationEvent("Calculus Exam", "fmi", canceller, List.of(recipientId)));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertEquals(1, saved.size());
        assertEquals(NotificationType.EVENT_CANCELLED, saved.get(0).getType());
        assertEquals("Event Cancelled: Calculus Exam", saved.get(0).getTitle());
    }
}
