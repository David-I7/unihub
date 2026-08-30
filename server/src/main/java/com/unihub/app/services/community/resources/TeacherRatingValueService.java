package com.unihub.app.services.community.resources;

import com.unihub.app.repositories.community.resources.TeacherRatingValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherRatingValueService {

    private final TeacherRatingValueRepository teacherRatingValueRepository;
}
