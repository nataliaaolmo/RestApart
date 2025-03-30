package com.eventbride.chat;
 
 import lombok.Getter;
 import lombok.Setter;
 
 @Getter
 @Setter
 public class ChatMessageRequest {
 	private String sender;
 	private String receiver;
 	private String content;
 }
