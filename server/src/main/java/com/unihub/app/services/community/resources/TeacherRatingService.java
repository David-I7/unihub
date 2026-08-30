package com.unihub.app.services.community.resources;

import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherRatingService {

    private final TeacherRatingRepository teacherRatingRepository;
}
