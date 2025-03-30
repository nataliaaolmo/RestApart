package com.eventbride.config;
 
 import com.eventbride.config.jwt.JWTUtils;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.http.server.ServerHttpRequest;
 import org.springframework.http.server.ServerHttpResponse;
 import org.springframework.stereotype.Component;
 import org.springframework.web.socket.WebSocketHandler;
 import org.springframework.web.socket.server.HandshakeInterceptor;
 import java.util.Map;
 
 @Component
 public class JwtHandshakeInterceptor implements HandshakeInterceptor {
 
 	@Autowired
 	private JWTUtils jwtUtils;
 
 	@Override
 	public boolean beforeHandshake(ServerHttpRequest request,
 								   ServerHttpResponse response,
 								   WebSocketHandler wsHandler,
 								   Map<String, Object> attributes) {
 		try {
 			String authHeader = request.getHeaders().getFirst("Authorization");
 			if (authHeader != null && authHeader.startsWith("Bearer ")) {
 				String jwt = authHeader.substring(7);
 				String username = jwtUtils.extractUsername(jwt);
 				if (username != null && jwtUtils.isTokenValid(jwt, null)) {
 					attributes.put("user", new StompPrincipal(username));
 				}
 			}
 		} catch (Exception e) {
 			return false;
 		}
 		return true;
 	}
 
 	@Override
 	public void afterHandshake(ServerHttpRequest request,
 							   ServerHttpResponse response,
 							   WebSocketHandler wsHandler,
 							   Exception exception) {
 	}
 }
