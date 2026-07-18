package com.feexray.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class EntitlementLimitExceededException extends RuntimeException {
    public EntitlementLimitExceededException(String message) {
        super(message);
    }
}
