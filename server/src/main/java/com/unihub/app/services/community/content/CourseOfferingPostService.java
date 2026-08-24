package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.CourseOfferingPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseOfferingPostService {

    private final CourseOfferingPostRepository courseOfferingPostRepository;

}
