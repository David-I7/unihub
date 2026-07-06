package com.unihub.app.exceptions;

public class InvalidJwtTokenException extends RuntimeException {
    public InvalidJwtTokenException(String message, Exception cause) {
        super(message,cause);
    }
}
