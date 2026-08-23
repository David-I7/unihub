package com.unihub.app;

import com.unihub.app.entities.community.content.*;
import com.unihub.app.repositories.community.content.ExamRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(FolderRepository folderRepository, Test test, ExamRepository examRepository) {
		return (args) ->{
			test.query(folderRepository,examRepository);
		};
	}

	@Service
	class Test{
		@Transactional
		public void query(FolderRepository folderRepository, ExamRepository examRepository){
			int courseOfferingId = 1;
			List<Folder> rootFolders = folderRepository.findRootFoldersByCourseOfferingId(courseOfferingId);

			rootFolders.forEach(folder -> {
				System.out.println("Folder: " + folder.getName());
				folder.getResources().forEach(resource -> {

					if (resource.getType().equals(ResourceType.ASSIGNMENT)) {
						System.out.println("Assignment: " + resource.getTitle());
						//List<Attachment> attachments = resource.getAttachments();
						//System.out.println("Number of attachments: " + attachments.size());
					} else if (resource.getType().equals(ResourceType.MATERIAL_FILE)) {
						if (resource.getFolder() == null){
							System.out.println("Attachment MaterialFile: " + resource.getTitle());
						}else  System.out.println("MaterialFile: " + resource.getTitle());
					}else if (resource.getType().equals(ResourceType.MATERIAL_LINK)) {
						if (resource.getFolder() == null){
							System.out.println("Attachment MaterialLink: " + resource.getTitle());
						}else  System.out.println("MaterialLink: " + resource.getTitle());
					}else if (resource.getType().equals(ResourceType.EXAM)) {
						System.out.println("Exam: " + resource.getTitle());
						Exam exam = examRepository.getExamWithAttachments(resource.getId()).orElseThrow();
						System.out.println("Number of attachments: " + exam.getAttachments().size());
						exam.getAttachments().forEach(attachment -> {
							if (attachment.getAttachmentType().equals(AttachmentType.MATERIAL_FILE)) {
								System.out.println("Attachment MaterialFile: " + attachment.getMaterialFile().getStorageKey());
							} else if (attachment.getAttachmentType().equals(AttachmentType.MATERIAL_LINK)) {
								System.out.println("Attachment MaterialLink: " + attachment.getMaterialLink().getUrl());
							}
						});
					}else if (resource.getType().equals(ResourceType.LECTURE)) {
						System.out.println("Lecture: " + resource.getTitle());
					}
				});
			});
		}
	}
}

