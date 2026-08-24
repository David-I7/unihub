package com.unihub.app.services.community.resources;

import com.unihub.app.repositories.community.resources.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

}
