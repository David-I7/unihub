package com.unihub.app.services.community.resources;

import com.unihub.app.repositories.community.resources.StudyYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudyYearService {

    private final StudyYearRepository studyYearRepository;

}
