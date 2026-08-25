package com.unihub.app.repositories.community.resources;

import com.unihub.app.dto.community.resources.StudyYearSummaryDto;
import com.unihub.app.entities.community.resources.StudyYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StudyYearRepository extends JpaRepository<StudyYear, Integer> {

    @Query("""
        SELECT new com.unihub.app.dto.community.resources.StudyYearSummaryDto(
            sy.id,
            sy.studyYearName,
            COUNT(DISTINCT co.course.id),
            COALESCE(SUM(co.creditPoints), 0L)
        )
        FROM StudyYear sy
        LEFT JOIN sy.courseOfferings co ON co.active = true
        WHERE sy.community.id = :communityId
        GROUP BY sy.id, sy.studyYearName
        ORDER BY sy.studyYearName ASC
    """)
    List<StudyYearSummaryDto> findSummariesByCommunityId(@Param("communityId") UUID communityId);
}
