package com.unihub.app.exceptions;

public class SessionReuseException extends RuntimeException{
    public SessionReuseException() {
        super("Session reuse detected");
    }
}
