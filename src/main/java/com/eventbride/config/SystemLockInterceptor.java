package com.eventbride.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@Component
public class SystemLockInterceptor implements HandlerInterceptor {

    @Autowired
    private SystemStatusRepository systemStatusRepository;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

@Override
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    String path = request.getRequestURI();

    // Excepciones: login y desbloqueo
    if (path.equals("/api/users/auth/login") || path.equals("/api/admin/unlock")) {
        return true;
    }

    boolean locked = systemStatusRepository.findById(1L)
                        .map(SystemStatus::isLocked)
                        .orElse(false);

    if (!locked) return true;

    // Si está bloqueado, comprobamos el token
    String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        String username = jwtUtils.extractUsername(token); // Usa tu utilidad de JWT

        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null && user.getRole().equals("ADMIN")) {
                return true;
            }
        }
    }

    // Si está bloqueado y no es admin
    response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
    response.getWriter().write("The system is temporarily locked by an administrator.");
    return false;
}


}

