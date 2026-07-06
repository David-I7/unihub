package com.unihub.app.mappers;

import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.User;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getUsername());
    }

    public User toEntity(UserDto userDto){
        return User.builder()
                .id(userDto.id())
                .email(userDto.email())
                .username(userDto.username())
                .build();
    }

}
