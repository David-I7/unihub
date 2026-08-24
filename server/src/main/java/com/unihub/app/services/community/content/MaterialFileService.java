package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.MaterialFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MaterialFileService {

    private final MaterialFileRepository materialFileRepository;

}
