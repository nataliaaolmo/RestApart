package com.eventbride.chat;
 
 import com.eventbride.model.BaseEntity;
 import com.eventbride.user.User;
 import jakarta.persistence.Entity;
 import jakarta.persistence.JoinColumn;
 import jakarta.persistence.ManyToOne;
 import lombok.Getter;
 import lombok.Setter;
 
 import java.time.LocalDateTime;
 
 @Entity
 @Getter
 @Setter
 public class ChatMessage extends BaseEntity {

 	@ManyToOne
 	@JoinColumn(name = "sender_id", nullable = false, unique = false)
 	private User sender;
    
 	@ManyToOne
 	@JoinColumn(name = "receiver_id", nullable = false, unique = false)
 	private User receiver;
 	private String content;
 	private LocalDateTime timestamp;
 }