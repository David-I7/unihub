package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.MaterialLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MaterialLinkService {

    private final MaterialLinkRepository materialLinkRepository;

}
