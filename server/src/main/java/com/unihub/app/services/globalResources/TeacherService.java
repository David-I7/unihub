package com.unihub.app.services.globalResources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final GlobalResourceMapper globalResourceMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<TeacherResponseDto> findAll(Pageable pageable) {
        return pageMapper.toPageDto(teacherRepository.findAll(pageable)
                .map(globalResourceMapper::toTeacherResponseDto));
    }

    @Transactional
    public Teacher create(Teacher teacher){
        Optional<Teacher> teacherOptional = teacherRepository.findByFirstNameAndLastName(teacher.getFirstName(), teacher.getLastName());

        if (teacherOptional.isPresent()) throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Teacher with the same first name and last name already exists"
        );

        return teacherRepository.save(teacher);
    }
}
