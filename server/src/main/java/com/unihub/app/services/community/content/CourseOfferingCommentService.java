package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.CourseOfferingCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseOfferingCommentService {

    private final CourseOfferingCommentRepository courseOfferingCommentRepository;

}
