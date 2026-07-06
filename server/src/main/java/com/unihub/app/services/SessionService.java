package com.unihub.app.services;

import com.unihub.app.config.SessionProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionProperties sessionProperties;

    private final JwtService jwtService;

}
