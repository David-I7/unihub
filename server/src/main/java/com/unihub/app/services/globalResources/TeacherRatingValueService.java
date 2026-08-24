package com.unihub.app.services.globalResources;

import com.unihub.app.repositories.globalResources.TeacherRatingValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherRatingValueService {

    private final TeacherRatingValueRepository teacherRatingValueRepository;

}
