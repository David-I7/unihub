package com.unihub.app.exceptions;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ProblemDetail> error(
            HttpServletRequest request) {

        Integer status = (Integer) request.getAttribute(
                RequestDispatcher.ERROR_STATUS_CODE
        );

        int statusCode = status != null ? status : 500;

        var problem = ProblemDetail.forStatus(statusCode);
        problem.setTitle("Request failed");
        problem.setDetail("An unexpected error occurred.");

        return ResponseEntity
                .status(statusCode)
                .body(problem);
    }

}