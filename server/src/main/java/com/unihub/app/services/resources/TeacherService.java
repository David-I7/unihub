package com.unihub.app.services.resources;

import com.unihub.app.entities.resources.Teacher;
import com.unihub.app.entities.resources.TeacherRating;
import com.unihub.app.repositories.resources.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
