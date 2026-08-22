package com.unihub.app;

import com.unihub.app.entities.community.content.*;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.globalResources.RatingMetricRepository;
import com.unihub.app.repositories.globalResources.TeacherRatingRepository;
import com.unihub.app.repositories.globalResources.TeacherRatingValueRepository;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import com.unihub.app.services.auth.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(FolderRepository folderRepository, Test test) {
		return (args) ->{
			test.query(folderRepository);
		};
	}

	@Service
	class Test{
		@Transactional
		public void query(FolderRepository folderRepository){
			int courseOfferingId = 1;
			List<Folder> rootFolders = folderRepository.findRootFoldersByCourseOfferingId(courseOfferingId);

			rootFolders.forEach(folder -> {
				System.out.println("Folder: " + folder.getName());
				folder.getResources().forEach(resource -> {
					if (resource.getType().equals("Assignment")) {
						System.out.println("Assignment: " + resource.getTitle());
//						List<Attachment> attachments = resource.getAttachments();
//						System.out.println("Number of attachments: " + attachments.size());
					} else if (resource.getType().equals("MaterialFile")) {
						System.out.println("MaterialFile: " + resource.getTitle());
					}else if (resource.getType().equals("MaterialLink")) {
						System.out.println("MaterialLink: " + resource.getTitle());
					}else if (resource.getType().equals("Exam")) {
						System.out.println("Exam: " + resource.getTitle());
//						List<Attachment> attachments = resource.getAttachments();
//						System.out.println("Number of attachments: " + attachments.size());
					}else if (resource.getType().equals("Lecture")) {
						System.out.println("Lecture: " + resource.getTitle());
					}
				});
			});
		}
	}
}

