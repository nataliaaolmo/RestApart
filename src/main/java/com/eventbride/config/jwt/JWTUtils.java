package com.eventbride.config.jwt;

import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JWTUtils {

    private SecretKey Key;

    private static final long EXPIRATION_TIME = 86400000L; // 1 día (en milisegundos)

    public JWTUtils() {
        // Usa una clave válida
        String secretString = "843567893696976453275974432697R634976R738467TR678T34865R6834R8763T478378637664538745673865783678548735687R3";
        byte[] keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
        this.Key = Keys.hmacShaKeyFor(keyBytes); // Usa una clave HmacSHA256 válida
    }

    public String generateToken(UserDetails userDetails) {
        String jwt = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();

        System.out.println("Generated JWT: " + jwt); // IMPRIMIR TOKEN PARA DEPURACIÓN
        return jwt;
    }

    public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails) {
        String refreshToken = Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME * 7)) // 7 días
                .signWith(Key)
                .compact();

        System.out.println("Generated Refresh Token: " + refreshToken); // IMPRIMIR TOKEN
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
