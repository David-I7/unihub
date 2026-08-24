package com.unihub.app.entities.community.content;

import com.unihub.app.entities.community.resources.CourseOffering;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_offering_posts")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseOfferingPost {

    @Id
    private UUID id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @MapsId
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_offering_id", nullable = false)
    private CourseOffering courseOffering;

}
