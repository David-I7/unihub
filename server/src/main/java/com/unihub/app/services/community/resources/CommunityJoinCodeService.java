package com.unihub.app.services.community.resources;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinCodeResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityJoinCode;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunityJoinCodeService {

    private static final String CODE_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CommunityJoinCodeRepository joinCodeRepository;
    private final CommunityRepository communityRepository;
    private final UserMapper userMapper;
    private final CommunityResourceMapper communityMapper;

    @Transactional
    public CommunityJoinCodeResponseDto createJoinCode(String communitySlug, UserDto caller, CreateJoinCodeRequestDto dto) {
        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        User callerUser = userMapper.toEntity(caller);

        String code = generateUniqueCode();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = (dto.validForHours() != null)
                ? now.plusHours(dto.validForHours())
                : null;

        CommunityJoinCode joinCode = communityMapper.toCommunityJoinCodeEntity(
                dto,
                community,
                callerUser,
                code,
                now,
                expiresAt
        );

        CommunityJoinCode saved = joinCodeRepository.save(joinCode);
        return communityMapper.toCommunityJoinCodeResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommunityJoinCodeResponseDto> getJoinCodes(String communitySlug) {
        if (!communityRepository.existsBySlug(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }
        return joinCodeRepository.findByCommunitySlugWithCommunity(communitySlug)
                .stream()
                .map(communityMapper::toCommunityJoinCodeResponseDto)
                .toList();
    }

    @Transactional
    public void deleteJoinCode(String communitySlug, UUID codeId) {
        CommunityJoinCode joinCode = joinCodeRepository.findById(codeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join code not found"));

        if (!joinCode.getCommunity().getSlug().equals(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Join code not found in this community");
        }

        joinCodeRepository.delete(joinCode);
    }

    @Transactional
    public CommunityJoinCodeResponseDto updateJoinCode(String communitySlug, UUID codeId, UpdateJoinCodeRequestDto dto) {
        if (dto.maxUses() == null && dto.validForHours() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        CommunityJoinCode joinCode = joinCodeRepository.findById(codeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join code not found"));

        if (!joinCode.getCommunity().getSlug().equals(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Join code not found in this community");
        }

        if (dto.maxUses() != null) {
            if (dto.maxUses() == -1) {
                joinCode.setMaxUses(null);
            } else if (dto.maxUses() > 0) {
                joinCode.setMaxUses(dto.maxUses());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "maxUses must be -1 or greater than 0");
            }
        }

        if (dto.validForHours() != null) {
            if (dto.validForHours() == -1) {
                joinCode.setExpiresAt(null);
            } else if (dto.validForHours() > 0) {
                joinCode.setExpiresAt(OffsetDateTime.now().plusHours(dto.validForHours()));
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validForHours must be -1 or greater than 0");
            }
        }

        CommunityJoinCode updated = joinCodeRepository.save(joinCode);
        return communityMapper.toCommunityJoinCodeResponseDto(updated);
    }

    private String generateUniqueCode() {
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int j = 0; j < CODE_LENGTH; j++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!joinCodeRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate a unique join code");
    }
}
