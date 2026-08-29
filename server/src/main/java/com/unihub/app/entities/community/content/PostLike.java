package com.unihub.app.entities.community.content;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_likes")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PostLike {

    @EmbeddedId
    private PostLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;
}
