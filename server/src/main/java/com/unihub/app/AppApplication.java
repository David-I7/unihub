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
		};
	}

}
