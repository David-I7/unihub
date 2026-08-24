package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;

}
