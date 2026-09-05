package com.unihub.app.dto.authentication;


import com.unihub.app.validation.Username;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LocalRegisterRequestDto {

    @Email
    @NotBlank
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank
    @Username
    private String username;

    @NotBlank
    @Size(min = 8, max = 64)
    private String password;

}
