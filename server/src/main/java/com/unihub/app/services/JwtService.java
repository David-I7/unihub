package com.unihub.app.services;

import com.unihub.app.exceptions.InvalidJwtTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private SecretKey SIGN_IN_KEY;

    public JwtService(@Value("${app.jwt.secret}") String JWT_SECRET){
        this.SIGN_IN_KEY =  Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    public String generateToken(String subject, Map<String,Object> claims, long expirationSec){
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(expirationSec);

        Date nowDate = Date.from(now);
        Date expirationDate = Date.from(expiration);

        return Jwts.builder()
                .issuedAt(nowDate)
                .expiration(expirationDate)
                .signWith(SIGN_IN_KEY)
                .subject(subject)
                .claims(claims)
                .compact();
    }

    public Claims parseClaims(String token){
        try {
            return Jwts.parser()
                    .verifyWith(SIGN_IN_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch (Exception e){
            String message;
            if ( e instanceof MalformedJwtException){
                message = "Malformed jwt token";
            }else if (e instanceof ExpiredJwtException){
                message = "Expired jwt token";
            }else{
                message = "Failed to parse jwt token";
            }

            throw new InvalidJwtTokenException(message,e);
        }
    }
}
