package com.ailecturenotes.controller;

import com.ailecturenotes.entity.User;
import com.ailecturenotes.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;

public abstract class BaseController {

    protected User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new UnauthorizedException("User session is not authenticated.");
        }
        return user;
    }
}
