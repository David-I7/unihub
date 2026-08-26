package com.unihub.app.repositories.community.resources;

import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudyYearRepository extends JpaRepository<StudyYear, Integer> {

    @Query("""
        SELECT new com.unihub.app.dto.community.resources.response.StudyYearResponseDto(
            sy.id,
            sy.studyYearName,
            COALESCE(SUM(CASE WHEN c.archived = false THEN 1L ELSE 0L END), 0L),
            COALESCE(SUM(CASE WHEN c.archived = true THEN 1L ELSE 0L END), 0L),
            COALESCE(SUM(CASE WHEN c.archived = false THEN CAST(c.creditPoints AS long) ELSE 0L END), 0L)
        )
        FROM StudyYear sy
        LEFT JOIN sy.courses c
        WHERE sy.community.slug = :communitySlug
        GROUP BY sy.id, sy.studyYearName
        ORDER BY sy.studyYearName ASC
    """)
    List<StudyYearResponseDto> findStudyYearsByCommunitySlug(@Param("communitySlug") String communitySlug);

    @Query("SELECT sy FROM StudyYear sy JOIN sy.community c WHERE c.slug = :communitySlug AND sy.studyYearName = :studyYearName")
    Optional<StudyYear> findByCommunitySlugAndStudyYearName(@Param("communitySlug") String communitySlug, @Param("studyYearName") StudyYearName studyYearName);
}
