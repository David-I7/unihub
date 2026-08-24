package com.unihub.app.services.community.resources;

import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunityMemberService {

    private final CommunityMemberRepository communityMemberRepository;

}
