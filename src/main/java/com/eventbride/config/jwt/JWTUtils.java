package com.eventbride.config.jwt;

import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;

@Component
public class JWTUtils {
    private SecretKey Key;

    @Value("${jwt.secret-key}")
    private String secretString;

    private static final long EXPIRATION_TIME = 86400000L; 

    @PostConstruct
    public void init() {

        byte[] keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
        this.Key = Keys.hmacShaKeyFor(keyBytes);

    }

    public String generateToken(UserDetails userDetails) {
        String jwt = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();
        return jwt;
    }

    public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails) {
        String refreshToken = Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME * 7)) 
                .signWith(Key)
                .compact();

        System.out.println("Generated Refresh Token: " + refreshToken); 
        return refreshToken;
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        try {
            return claimsTFunction.apply(
                    Jwts.parser().verifyWith(Key).build().parseSignedClaims(token).getPayload()
            );
        } catch (Exception e) {
            System.out.println("Error al extraer claims del JWT: " + e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        Date expiration = extractClaims(token, Claims::getExpiration);
        return expiration != null && expiration.before(new Date());
    }
}
