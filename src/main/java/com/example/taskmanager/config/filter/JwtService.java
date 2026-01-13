package com.example.taskmanager.config.filter;

import com.example.taskmanager.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public record JwtService(
        @Value("${app.jwt.access.secretKey}") String accessSecretKey,
        @Value("${app.jwt.access.expirationAt}") long accessExpirationAt,
        @Value("${app.jwt.refresh.secretKey}") String refreshSecretKey,
        @Value("${app.jwt.refresh.expirationAt}") long refreshExpirationAt
) {


    public String generateAccessToken(User user) {
        return generateToken(user, accessExpirationAt, accessSecretKey);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, refreshExpirationAt, refreshSecretKey);
    }

    private String generateToken(User user, Long expirationTime, String secretKey) {
        return Jwts
                .builder()
                .subject(user.getId().toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignInKey(secretKey))
                .compact();
    }

    private SecretKey getSignInKey(String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getIdFromAccessToken(String token) {
        return getIdFromToken(token, accessSecretKey);
    }

    public String getIdFromRefreshToken(String token) {
        return getIdFromToken(token, refreshSecretKey);
    }

    private String getIdFromToken(String token, String secretKey) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey(secretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
