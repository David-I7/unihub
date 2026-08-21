package com.unihub.app;

import com.unihub.app.entities.auth.User;
import com.unihub.app.entities.resources.RatingMetric;
import com.unihub.app.entities.resources.Teacher;
import com.unihub.app.entities.resources.TeacherRating;
import com.unihub.app.entities.resources.TeacherRatingValue;
import com.unihub.app.repositories.resources.RatingMetricRepository;
import com.unihub.app.repositories.resources.TeacherRatingRepository;
import com.unihub.app.repositories.resources.TeacherRatingValueRepository;
import com.unihub.app.repositories.resources.TeacherRepository;
import com.unihub.app.services.auth.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(RatingMetricRepository ratingMetricRepository,
	                                           TeacherRepository teacherRepository,
	                                           TeacherRatingRepository teacherRatingRepository,
	                                           TeacherRatingValueRepository teacherRatingValueRepository,
	                                           UserService	userService,
	                                           PasswordEncoder passwordEncoder) {
		return (args) ->{
			Set<RatingMetric> ratingMetrics = Set.copyOf(ratingMetricRepository.findAll());

			User user = userService.register(
					User.builder()
							.password(passwordEncoder.encode("password"))
							.username("myUser")
							.email("myUser@example.com")
							.build()
			);

			Teacher teacher = teacherRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No teacher found"));

			Set<TeacherRatingValue> teacherRatingValues = new HashSet<>();

			ratingMetrics.forEach(ratingMetric -> teacherRatingValues.add(TeacherRatingValue.builder().ratingMetric(ratingMetric).value(5).build()));

			TeacherRating teacherRating = TeacherRating.builder()
					.title("Test Rating")
					.user(user)
					.teacher(teacher)
					.title("Test Rating")
					.description("This is a test rating")
					.values(null)
					.build();

			teacherRatingRepository.save(teacherRating);
			teacherRatingValues.forEach(teacherRatingValue -> {
				teacherRatingValue.setTeacherRating(teacherRating);
				teacherRatingValueRepository.save(teacherRatingValue);
			});

			TeacherRating savedTeacherRatings = teacherRatingRepository.findAll().stream().toList().stream().findFirst().orElse(null);

			System.out.println(savedTeacherRatings);
		};
	}

}
