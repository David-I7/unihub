package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.CoursePostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoursePostService {

    private final CoursePostRepository coursePostRepository;

}
