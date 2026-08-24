package com.unihub.app.services.globalResources;

import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public Teacher create(Teacher teacher){
        Optional<Teacher> teacherOptional = teacherRepository.findByFirstNameAndLastName(teacher.getFirstName(), teacher.getLastName());

        if (teacherOptional.isPresent()) throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Teacher with the same first name and last name already exists"
        );

        return teacherRepository.save(teacher);
    }

}
