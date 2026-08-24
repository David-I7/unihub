package com.unihub.app.services.globalResources;

import com.unihub.app.repositories.globalResources.TeacherRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherRatingService {

    private final TeacherRatingRepository teacherRatingRepository;

}
