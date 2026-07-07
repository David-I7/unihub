package com.unihub.app.dto.auth;

import com.unihub.app.validation.UsernameOrEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@UsernameOrEmail
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LocalUsernameOrEmailLoginRequestDto {

    private String email;

    private String username;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
