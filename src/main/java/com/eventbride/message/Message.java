package com.eventbride.message;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.model.BaseEntity;
import com.eventbride.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "messages")
public class Message extends BaseEntity {

    @Column(name = "message_date", nullable = false)
    @NotBlank 
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate MessageDate;

    @Column(name = "text", nullable = false)
    @NotBlank 
    private String text;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

}
