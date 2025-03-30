package com.eventbride.chat;
 
 import com.eventbride.user.User;
 import com.eventbride.user.UserService;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.messaging.handler.annotation.MessageMapping;
 import org.springframework.messaging.simp.SimpMessagingTemplate;
 import org.springframework.stereotype.Controller;
 
 import java.time.LocalDateTime;
 import java.util.Optional;
 
 @Controller
 public class ChatController {
 
 	private final ChatRepository repository;
 	private final SimpMessagingTemplate messagingTemplate;
 	private final UserService userService;
 
 	@Autowired
 	public ChatController(SimpMessagingTemplate messagingTemplate, ChatRepository repo, UserService userService) {
 		this.messagingTemplate = messagingTemplate;
 		this.repository = repo;
 		this.userService = userService;
 	}
 
	 @MessageMapping("/chat.private")
	 public void sendPrivateMessage(ChatMessageRequest message) {
		 System.out.println("[WebSocket] Mensaje recibido de " + message.getSender() + " a " + message.getReceiver());
		 ChatMessage messageToSave = new ChatMessage();
		 messageToSave.setTimestamp(LocalDateTime.now());
		 Optional<User> receiver = userService.getUserByUsername(message.getReceiver());
		 Optional<User> sender = userService.getUserByUsername(message.getSender());
		 
		 if (receiver.isPresent() && sender.isPresent()) {
			 messageToSave.setReceiver(receiver.get());
			 messageToSave.setSender(sender.get());
			 messageToSave.setContent(message.getContent());
			 repository.save(messageToSave);

			 messagingTemplate.convertAndSendToUser(
				 message.getReceiver(),
				 "/queue/messages",
				 message
			 );
		 }
	 }
	 
 
 }
