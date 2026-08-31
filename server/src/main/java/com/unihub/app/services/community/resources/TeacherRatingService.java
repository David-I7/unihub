package com.unihub.app.services.community.resources;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.request.RatingValueRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.RatingMetric;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.entities.community.resources.TeacherRating;
import com.unihub.app.entities.community.resources.TeacherRatingValue;
import com.unihub.app.entities.community.resources.TeacherRatingValueId;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.RatingMetricRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherRatingService {

    private final TeacherRatingRepository teacherRatingRepository;
    private final TeacherRepository teacherRepository;
    private final RatingMetricRepository ratingMetricRepository;
    private final AuthorizationService authorizationService;
    private final CommunityResourceMapper resourceMapper;
    private final UserMapper userMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<TeacherRatingResponseDto> getPaginatedRatings(UUID teacherId, Pageable pageable) {
        if (!teacherRepository.existsById(teacherId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found");
        }

        Page<TeacherRating> page = teacherRatingRepository.findByTeacherIdWithAuthorAndValues(teacherId, pageable);
        return pageMapper.toPageDto(page.map(resourceMapper::toTeacherRatingResponseDto));
    }

    @Transactional
    public TeacherRatingResponseDto createRating(UUID teacherId, UserDto caller, CreateTeacherRatingRequestDto dto) {
        if (caller == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        String communitySlug = teacher.getCommunity().getSlug();
        if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.CREATE_TEACHER_RATING)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to rate teacher");
        }

        if (teacherRatingRepository.existsByTeacherIdAndUserId(teacherId, caller.id())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this teacher");
        }

        Map<Integer, RatingMetric> metricMap = validateAndGetRatingMetrics(dto.values());

        User user = userMapper.toEntity(caller);
        TeacherRating rating = TeacherRating.builder()
                .teacher(teacher)
                .user(user)
                .title(dto.title())
                .description(dto.description() != null ? dto.description() : null)
                .isAnonymous(dto.isAnonymous())
                .build();

        Set<TeacherRatingValue> ratingValues = new HashSet<>();
        for (RatingValueRequestDto valDto : dto.values()) {
            RatingMetric metric = metricMap.get(valDto.metricId());
            TeacherRatingValue val = TeacherRatingValue.builder()
                    .id(new TeacherRatingValueId(0L, metric.getId()))
                    .teacherRating(rating)
                    .ratingMetric(metric)
                    .value(valDto.value())
                    .build();
            ratingValues.add(val);
        }
        rating.setValues(ratingValues);

        TeacherRating savedRating = teacherRatingRepository.save(rating);

        double reviewMetricsSum = dto.values().stream().mapToInt(RatingValueRequestDto::value).sum();
        float reviewMetricsAvg = (float) reviewMetricsSum / dto.values().size();

        int oldCount = teacher.getRatingsCount();
        float oldAvg = teacher.getAverageRating();
        int newCount = oldCount + 1;
        float newAvg = Math.round(((oldAvg * oldCount + reviewMetricsAvg) / newCount) * 10.0f) / 10.0f;

        teacher.setRatingsCount(newCount);
        teacher.setAverageRating(newAvg);
        teacherRepository.save(teacher);

        return resourceMapper.toTeacherRatingResponseDto(savedRating);
    }

    @Transactional
    public TeacherRatingResponseDto updateRating(
            UUID teacherId,
            Long ratingId,
            UserDto caller,
            UpdateTeacherRatingRequestDto dto
    ) {
        if (caller == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        TeacherRating rating = teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (!rating.getTeacher().getId().equals(teacherId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found for this teacher");
        }

        if (rating.getUser() == null || !rating.getUser().getId().equals(caller.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own review");
        }

        String communitySlug = rating.getTeacher().getCommunity().getSlug();
        if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.UPDATE_TEACHER_RATING)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to update review");
        }

        Map<Integer, RatingMetric> metricMap = validateAndGetRatingMetrics(dto.values());

        double oldReviewSum = rating.getValues() != null
                ? rating.getValues().stream().mapToInt(TeacherRatingValue::getValue).sum()
                : 0.0;
        float oldReviewAvg = (rating.getValues() == null || rating.getValues().isEmpty())
                ? 0.0f
                : (float) oldReviewSum / rating.getValues().size();

        double newReviewSum = dto.values().stream().mapToInt(RatingValueRequestDto::value).sum();
        float newReviewAvg = (float) newReviewSum / dto.values().size();

        rating.setTitle(dto.title());
        rating.setDescription(dto.description());
        rating.setAnonymous(dto.isAnonymous());

        if (rating.getValues() == null) {
            rating.setValues(new HashSet<>());
        }

        Map<Integer, TeacherRatingValue> existingValuesMap = rating.getValues().stream()
                .collect(Collectors.toMap(v -> v.getRatingMetric().getId(), v -> v));

        for (RatingValueRequestDto valDto : dto.values()) {
            TeacherRatingValue existingVal = existingValuesMap.get(valDto.metricId());
            if (existingVal != null) {
                existingVal.setValue(valDto.value());
            } else {
                RatingMetric metric = metricMap.get(valDto.metricId());
                TeacherRatingValue newVal = TeacherRatingValue.builder()
                        .id(new TeacherRatingValueId(rating.getId(), metric.getId()))
                        .teacherRating(rating)
                        .ratingMetric(metric)
                        .value(valDto.value())
                        .build();
                rating.getValues().add(newVal);
            }
        }

        TeacherRating savedRating = teacherRatingRepository.save(rating);

        Teacher teacher = rating.getTeacher();
        int count = teacher.getRatingsCount();
        if (count > 0) {
            float oldAvg = teacher.getAverageRating();
            float newAvg = Math.round(((oldAvg * count - oldReviewAvg + newReviewAvg) / count) * 10.0f) / 10.0f;
            teacher.setAverageRating(newAvg);
            teacherRepository.save(teacher);
        }

        return resourceMapper.toTeacherRatingResponseDto(savedRating);
    }

    @Transactional
    public void deleteRating(UUID teacherId, Long ratingId, UserDto caller) {
        if (caller == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        TeacherRating rating = teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (!rating.getTeacher().getId().equals(teacherId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found for this teacher");
        }

        boolean isAuthor = rating.getUser() != null && rating.getUser().getId().equals(caller.id());
        String communitySlug = rating.getTeacher().getCommunity().getSlug();

        if (isAuthor) {
            if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.DELETE_TEACHER_RATING)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to delete review");
            }
        } else {
            if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.MODERATE_TEACHER_RATING)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to moderate review");
            }
        }

        double reviewSum = rating.getValues() != null
                ? rating.getValues().stream().mapToInt(TeacherRatingValue::getValue).sum()
                : 0.0;
        float reviewAvg = (rating.getValues() == null || rating.getValues().isEmpty())
                ? 0.0f
                : (float) reviewSum / rating.getValues().size();

        teacherRatingRepository.delete(rating);

        Teacher teacher = rating.getTeacher();
        int oldCount = teacher.getRatingsCount();
        float oldAvg = teacher.getAverageRating();
        if (oldCount <= 1) {
            teacher.setRatingsCount(0);
            teacher.setAverageRating(0.0f);
        } else {
            int newCount = oldCount - 1;
            float newAvg = Math.round(((oldAvg * oldCount - reviewAvg) / newCount) * 10.0f) / 10.0f;
            teacher.setRatingsCount(newCount);
            teacher.setAverageRating(newAvg);
        }
        teacherRepository.save(teacher);
    }

    private Map<Integer, RatingMetric> validateAndGetRatingMetrics(List<RatingValueRequestDto> values) {
        List<RatingMetric> allMetrics = ratingMetricRepository.findAll();
        if (allMetrics.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No rating metrics configured");
        }

        if (values.size() != allMetrics.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ratings must be provided for all metrics");
        }

        Set<Integer> uniqueMetricIds = values.stream()
                .map(RatingValueRequestDto::metricId)
                .collect(Collectors.toSet());

        if (uniqueMetricIds.size() != values.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate metric IDs provided");
        }

        Map<Integer, RatingMetric> metricMap = allMetrics.stream()
                .collect(Collectors.toMap(RatingMetric::getId, Function.identity()));

        for (Integer metricId : uniqueMetricIds) {
            if (!metricMap.containsKey(metricId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid metric ID: " + metricId);
            }
        }

        return metricMap;
    }
}
