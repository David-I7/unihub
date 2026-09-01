package com.unihub.app.repositories.community.content;

import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("""
        SELECT new com.unihub.app.dto.community.content.response.CalendarEventResponseDto(
                e.id,
                e.title,
                e.type,
                e.startTime,
                e.durationHours,
                e.location,
                c.abbreviation,
                CASE WHEN (SELECT COUNT(er.id) FROM EventReminder er WHERE er.event = e 
                AND er.user.id = :userId) > 0 THEN true ELSE false END
        ) From Event e 
          JOIN e.community comm 
          JOIN e.course c 
          JOIN c.studyYear sy
          LEFT JOIN e.reminders er ON er.user.id = :userId
        WHERE comm.id IN :communityIds
          AND (CAST(:courseSlug AS string) IS NULL OR c.slug = :courseSlug)
          AND (CAST(:studyYearName AS string) IS NULL OR sy.studyYearName = :studyYearName)
          AND e.startTime >= :from
          AND e.startTime <= :to
        ORDER BY e.startTime ASC
    """)
    List<CalendarEventResponseDto> findEventsByCommunityIds(
            @Param("communityIds") List<UUID> communityIds,
            @Param("courseSlug") String courseSlug,
            @Param("studyYearName") StudyYearName studyYearName,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("userId") UUID userId
    );

    @Query(value = """
        SELECT new com.unihub.app.dto.community.content.response.CalendarEventResponseDto(
                e.id,
                e.title,
                e.type,
                e.startTime,
                e.durationHours,
                e.location,
                c.abbreviation,
                CASE WHEN (SELECT COUNT(er.id) FROM EventReminder er WHERE er.event = e 
                AND er.user.id = :userId) > 0 THEN true ELSE false END
        ) FROM Event e 
          JOIN e.community comm 
          JOIN e.course c 
          JOIN c.studyYear sy
        WHERE comm.id IN :communityIds
          AND e.startTime >= :from
          AND e.startTime <= :to
        ORDER BY e.startTime ASC
    """, countQuery = """
        SELECT COUNT(e) FROM Event e
        WHERE e.community.id IN :communityIds
          AND e.startTime >= :from
          AND e.startTime <= :to
    """)
    Page<CalendarEventResponseDto> findUpcomingEventsByCommunityIds(
            @Param("communityIds") List<UUID> communityIds,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
        SELECT new com.unihub.app.dto.community.content.response.EventResponseDto(
            e.id,
            e.title,
            e.type,
            e.description,
            e.locationDetails,
            e.startTime,
            e.durationHours,
            e.location,
            c.slug,
            c.name,
            c.abbreviation,
            comm.slug,
            comm.name,
            sy.studyYearName,
            new com.unihub.app.dto.community.OwnerDto(
               u.id,
               u.username,
               CASE WHEN u.deletedAt = null then true else false end
            ),
            null
        ) FROM Event e
        JOIN e.community comm
        JOIN e.course c
        JOIN c.studyYear sy
        JOIN e.owner u
        WHERE e.id = :eventId
    """)
    Optional<EventResponseDto> findEventById(@Param("eventId") UUID eventId);

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.course c
        JOIN FETCH e.community comm
        LEFT JOIN FETCH e.owner
        WHERE comm.slug = :communitySlug AND e.id = :eventId
    """)
    Optional<Event> findByCommunitySlugAndId(@Param("communitySlug") String communitySlug, @Param("eventId") UUID eventId);
}
