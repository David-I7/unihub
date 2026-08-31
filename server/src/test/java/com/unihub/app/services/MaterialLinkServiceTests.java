package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateMaterialLinkRequestDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialLinkRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.community.content.MaterialLinkService;
import com.unihub.app.validation.MaterialLinkValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MaterialLinkServiceTests {

    @Mock
    private MaterialLinkRepository materialLinkRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private MaterialLinkValidator materialLinkValidator = new MaterialLinkValidator();

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private MaterialLinkService materialLinkService;

    private User owner;
    private UserDto ownerDto;
    private Course course;

    @BeforeEach
    public void setUp() {
        UUID ownerId = UUID.randomUUID();
        owner = User.builder().id(ownerId).username("david").build();
        ownerDto = new UserDto(ownerId, "david@test.com", "david", true, RoleType.USER);

        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        course = Course.builder().id(5L).slug("math").studyYear(studyYear).build();
    }

    @Test
    @DisplayName("Create MaterialLink with valid URL and link type")
    public void testCreateMaterialLink_Success() {
        CreateMaterialLinkRequestDto requestDto = new CreateMaterialLinkRequestDto(
                "Course Repo",
                "Official github repo",
                null,
                "https://github.com/org/repo",
                MaterialLinkType.GITHUB
        );

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("math", "fmi", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCase(5L, "Course Repo"))
                .thenReturn(false);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(materialLinkRepository.save(any(MaterialLink.class))).thenAnswer(invocation -> {
            MaterialLink link = invocation.getArgument(0);
            link.setId(UUID.randomUUID());
            return link;
        });

        MaterialLinkDto result = materialLinkService.createMaterialLink("fmi", StudyYearName.YEAR_1, "math", ownerDto, requestDto);
        assertNotNull(result);
        assertEquals("Course Repo", result.title());
        assertEquals("https://github.com/org/repo", result.url());
        assertEquals(MaterialLinkType.GITHUB, result.linkType());
    }

    @Test
    @DisplayName("Create MaterialLink with mismatched domain throws Bad Request")
    public void testCreateMaterialLink_InvalidDomain() {
        CreateMaterialLinkRequestDto requestDto = new CreateMaterialLinkRequestDto(
                "Course Repo",
                "Official github repo",
                null,
                "https://gitlab.com/org/repo",
                MaterialLinkType.GITHUB
        );

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("math", "fmi", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));

        assertThrows(ResponseStatusException.class, () ->
                materialLinkService.createMaterialLink("fmi", StudyYearName.YEAR_1, "math", ownerDto, requestDto)
        );
    }
}
