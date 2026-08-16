package com.unihub.app.exceptions;

import com.unihub.app.dto.validation.ConstraintValidationDto;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.utils.ProblemDetailUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.List;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final ObjectErrorMapper objectErrorMapper;

    private final ProblemDetailUtil problemDetailUtil;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(HttpServletRequest request, MethodArgumentNotValidException e){
        ProblemDetail problemDetail = problemDetailUtil.defaultProblemDetail(HttpStatus.BAD_REQUEST,request.getRequestURI());

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
            problemDetail.setTitle(HttpStatus.UNAUTHORIZED.getReasonPhrase());
        }else{
            problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            problemDetail.setTitle(HttpStatus.BAD_REQUEST.getReasonPhrase());
        }

        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setType(URI.create("about:blank"));
        problemDetail.setDetail(e.getBody().getDetail());

        return ResponseEntity.status(problemDetail.getStatus()).body(problemDetail);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleResponseStatusException(HttpServletRequest request, ResponseStatusException e){
        HttpStatus status = HttpStatus.valueOf(e.getStatusCode().value());
        ProblemDetail problemDetail = problemDetailUtil.defaultProblemDetail(status, request.getRequestURI());
        problemDetail.setDetail(e.getReason());
        return ResponseEntity.status(problemDetail.getStatus()).body(problemDetail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleAllExceptions(HttpServletRequest request, Exception e){
        log.error("Exception occurred: {}",e.getMessage(),e);
        ProblemDetail problemDetail = problemDetailUtil.defaultProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR,request.getRequestURI());
        return ResponseEntity.status(problemDetail.getStatus()).body(problemDetail);
    }
}
