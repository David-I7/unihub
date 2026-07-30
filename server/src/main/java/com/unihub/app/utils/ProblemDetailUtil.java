package com.unihub.app.utils;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;

@Component
@RequiredArgsConstructor
public class ProblemDetailUtil {

    private final ObjectMapper objectMapper;

    public ProblemDetail defaultProblemDetail(HttpStatus status, String uri){
        ProblemDetail problemDetail = ProblemDetail.forStatus(status);
        problemDetail.setInstance(URI.create(uri));
        problemDetail.setType(URI.create("about:blank"));
        problemDetail.setTitle(status.getReasonPhrase());
        return problemDetail;
    }

    public void writeProblemDetail(HttpServletRequest request, HttpServletResponse response, HttpStatus status){
        _writeProblemDetail(request,response,status,null);
    }

    public void writeProblemDetail(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String detail){
        _writeProblemDetail(request,response,status,detail);
    }

    private void _writeProblemDetail(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String detail){
        ProblemDetail problemDetail = defaultProblemDetail(status,request.getRequestURI());

        if(detail != null) {
            problemDetail.setDetail(detail);
        }

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        try {
            response.getWriter().write(objectMapper.writeValueAsString(problemDetail));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
