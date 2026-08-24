package com.unihub.app.entities.community.content;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_offering_comment")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseOfferingComment {

    @Id
    private UUID id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    @MapsId
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_offering_post_id", nullable = false)
    private CourseOfferingPost courseOfferingPost;

}
