package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.CommunityMembersId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, CommunityMembersId> {
}
