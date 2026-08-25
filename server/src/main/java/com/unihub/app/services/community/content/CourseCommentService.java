package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.CourseCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseCommentService {

    private final CourseCommentRepository courseCommentRepository;

}
