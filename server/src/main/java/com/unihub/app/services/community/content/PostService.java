package com.unihub.app.services.community.content;

import com.unihub.app.repositories.community.content.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

}
