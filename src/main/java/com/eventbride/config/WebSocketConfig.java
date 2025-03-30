package com.eventbride.config;
 
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.context.annotation.Configuration;
 import org.springframework.messaging.Message;
 import org.springframework.messaging.MessageChannel;
 import org.springframework.messaging.simp.config.MessageBrokerRegistry;
 import org.springframework.messaging.simp.stomp.StompCommand;
 import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
 import org.springframework.messaging.support.ChannelInterceptor;
 import org.springframework.messaging.support.MessageHeaderAccessor;
 import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
 import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
 import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
 
 @Configuration
 @EnableWebSocketMessageBroker
 public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
 
 	@Autowired
 	private JwtHandshakeInterceptor jwtHandshakeInterceptor;
 
 	@Override
 	public void configureMessageBroker(MessageBrokerRegistry config) {
 		config.enableSimpleBroker("/queue"); // Para enviar mensajes al frontend
 		config.setApplicationDestinationPrefixes("/app"); // Para recibir mensajes del frontend
 		config.setUserDestinationPrefix("/user"); // para usar convertAndSendToUser
 	}
 
 	@Override
 	public void registerStompEndpoints(StompEndpointRegistry registry) {
 		registry.addEndpoint("/ws")
 				.addInterceptors(jwtHandshakeInterceptor)
 				.setAllowedOriginPatterns("*")
 				.withSockJS();
 	}
 
 	@Override
 	public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
 		registration.interceptors(new ChannelInterceptor() {
 			@Override
 			public Message<?> preSend(Message<?> message, MessageChannel channel) {
 				StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
 				if (StompCommand.CONNECT.equals(accessor.getCommand())) {
 					// Obtener el Principal guardado en el HandshakeInterceptor
 					Object rawUser = accessor.getSessionAttributes().get("user");
 					if (rawUser instanceof java.security.Principal user) {
 						accessor.setUser(user);
 						System.out.println("[WebSocket] Usuario autenticado: " + user.getName());
 					}
 				}
 				return message;
 			}
 		});
 	}
 
 }