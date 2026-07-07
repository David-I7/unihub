package com.unihub.app.exceptions;

import com.unihub.app.dto.validation.ConstraintValidationDto;
import com.unihub.app.mappers.ObjectErrorMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.List;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ObjectErrorMapper objectErrorMapper;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(HttpServletRequest request, MethodArgumentNotValidException e){
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setType(URI.create("about:blank"));
        problemDetail.setTitle(HttpStatus.BAD_REQUEST.toString());

        List<ConstraintValidationDto> validationDtos =
                e.getAllErrors().stream()
                        .map(objectErrorMapper::toDto)
                        .toList();

        problemDetail.setProperty("errors",validationDtos);

        return ResponseEntity.status(problemDetail.getStatus()).body(problemDetail);
    }

    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ProblemDetail> handleMissingRefreshTokenException(HttpServletRequest request, MissingRequestCookieException e){
        ProblemDetail problemDetail;

        if(e.getCookieName().equals("refreshToken")){
            problemDetail = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
            problemDetail.setTitle(HttpStatus.UNAUTHORIZED.toString());
        }else{
            problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            problemDetail.setTitle(HttpStatus.BAD_REQUEST.toString());
        }

        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setType(URI.create("about:blank"));
        problemDetail.setDetail(e.getBody().getDetail());

        return ResponseEntity.status(problemDetail.getStatus()).body(problemDetail);
    }
}
