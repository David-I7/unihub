package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.course c
        JOIN FETCH e.community comm
        LEFT JOIN FETCH e.owner
        WHERE comm.slug = :communitySlug
          AND (:courseSlug IS NULL OR c.slug = :courseSlug)
          AND (:studyYearName IS NULL OR c.studyYear.studyYearName = :studyYearName)
          AND (:type IS NULL OR e.type = :type)
          AND (CAST(:from AS string) IS NULL OR e.startTime >= :from)
          AND (CAST(:to AS string) IS NULL OR e.startTime <= :to)
        ORDER BY e.startTime ASC
    """)
    List<Event> findEvents(
            @Param("communitySlug") String communitySlug,
            @Param("courseSlug") String courseSlug,
            @Param("studyYearName") StudyYearName studyYearName,
            @Param("type") EventType type,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.course c
        JOIN FETCH e.community comm
        LEFT JOIN FETCH e.owner
        WHERE comm.slug = :communitySlug AND e.id = :eventId
    """)
    Optional<Event> findByCommunitySlugAndId(@Param("communitySlug") String communitySlug, @Param("eventId") UUID eventId);

    List<Event> findByCourseId(Long courseId);
}
