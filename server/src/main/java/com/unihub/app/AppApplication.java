package com.unihub.app;

import com.unihub.app.entities.community.content.*;
import com.unihub.app.repositories.community.content.ExamRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	@Bean
	@Profile("cli")
	public CommandLineRunner commandLineRunner(FolderRepository folderRepository, Test test, ExamRepository examRepository) {
		return (args) -> {
			test.query(folderRepository, examRepository);
		};
	}

	@Service
	@Profile("cli")
	class Test {
		@Transactional
		public void query(FolderRepository folderRepository, ExamRepository examRepository) {
			int courseOfferingId = 1;
			List<Folder> rootFolders = folderRepository.findRootFoldersByCourseOfferingId(courseOfferingId);

			rootFolders.forEach(folder -> {
				System.out.println("Folder: " + folder.getName());
				folder.getResources().forEach(resource -> {
					if (resource.getType().equals(ResourceType.ASSIGNMENT)) {
						System.out.println("Assignment: " + resource.getTitle());
					} else if (resource.getType().equals(ResourceType.MATERIAL_FILE)) {
						System.out.println("MaterialFile: " + resource.getTitle());
					} else if (resource.getType().equals(ResourceType.MATERIAL_LINK)) {
						System.out.println("MaterialLink: " + resource.getTitle());
					} else if (resource.getType().equals(ResourceType.EXAM)) {
						System.out.println("Exam: " + resource.getTitle());
					} else if (resource.getType().equals(ResourceType.LECTURE)) {
						System.out.println("Lecture: " + resource.getTitle());
					}
				});
			});
		}
	}
}
