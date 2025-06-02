package com.eventbride.chat;

 import com.eventbride.user.User;
 import com.eventbride.user.UserService;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.http.ResponseEntity;
 import org.springframework.security.core.Authentication;
 import org.springframework.security.core.context.SecurityContextHolder;
 import org.springframework.web.bind.annotation.GetMapping;
 import org.springframework.web.bind.annotation.PathVariable;
 import org.springframework.web.bind.annotation.RequestMapping;
 import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
 import java.util.Optional;
 
 @RestController
 @RequestMapping("/api/chat")
 public class ChatRestController {
 
 	@Autowired
 	private ChatRepository chatRepository;
 
 	@Autowired
 	private UserService userService;
 
 	@GetMapping("/{recieverId}")
 	public ResponseEntity<?> findAllMessagesByUsers(@PathVariable Integer recieverId) {
 
 		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
 		Optional<User> sender = userService.getUserByUsername(auth.getName());
 		Optional<User> reciver = userService.getUserById(recieverId);
 		if (!sender.isPresent() || !reciver.isPresent()) {
 			return ResponseEntity.notFound().build();
 		}
 		List<ChatMessage> messages = chatRepository.findMessagesBetweenUsers(sender.get(), reciver.get());
		if(messages.isEmpty()) {
			return ResponseEntity.ok(new ArrayList<ChatMessage>());
 	}
	 return ResponseEntity.ok(messages);
	}

	 @GetMapping("/inbox")
	 public ResponseEntity<?> getConversations() {
		 Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		 Optional<User> current = userService.getUserByUsername(auth.getName());
		 if (current.isEmpty()) return ResponseEntity.notFound().build();
	 
		 List<User> users = chatRepository.findDistinctChatPartners(current.get().getId());
		 return ResponseEntity.ok(users);
	}
	 
 
 }
