package com.eventbride.user;

import java.util.List;

import com.eventbride.model.Comment;
import com.eventbride.model.Message;
import com.eventbride.model.Person;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends Person{

   @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> receivedComments;

    @OneToMany(mappedBy = "sender")
    private List<Message> sentMessages;

    @OneToMany(mappedBy = "receiver")
    private List<Message> receivedMessages;
    
}
