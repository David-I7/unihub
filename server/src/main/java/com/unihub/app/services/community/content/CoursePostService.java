package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.CoursePost;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CoursePostService {

    private final CourseRepository courseRepository;
    private final PostRepository postRepository;
    private final CoursePostRepository coursePostRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;
    private final PageMapper pageMapper;

    @Transactional
    public PostResponseDto createCoursePost(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto caller,
            CreatePostRequestDto dto
    ) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        User owner = userMapper.toEntity(caller);
        Post post = contentMapper.toPostEntity(dto, CommunicationChannel.COURSE, owner);
        Post savedPost = postRepository.save(post);

        CoursePost coursePost = CoursePost.builder()
                .post(savedPost)
                .course(course)
                .build();
        coursePostRepository.save(coursePost);

        return contentMapper.toPostResponseDto(savedPost, false);
    }

    @Transactional(readOnly = true)
    public PageDto<PostResponseDto> getCoursePosts(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto caller,
            Pageable pageable
    ) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Page<Post> postsPage = coursePostRepository.findPostsByCourseId(course.getId(), pageable);

        if (postsPage.isEmpty()) {
            return pageMapper.toPageDto(postsPage.map(contentMapper::toPostResponseDto));
        }

        List<UUID> postIds = postsPage.getContent().stream()
                .map(Post::getId)
                .toList();

        Set<UUID> likedPostIds = (caller != null)
                ? postLikeRepository.findLikedPostIdsByUserIdAndPostIdIn(caller.id(), postIds)
                : Collections.emptySet();

        List<PostResponseDto> postDtos = postsPage.getContent().stream()
                .map(post -> {
                    Boolean isLiked = (caller != null) ? likedPostIds.contains(post.getId()) : null;
                    return contentMapper.toPostResponseDto(post, isLiked);
                })
                .toList();

        Page<PostResponseDto> dtoPage = new PageImpl<>(postDtos, pageable, postsPage.getTotalElements());
        return pageMapper.toPageDto(dtoPage);
    }
}
