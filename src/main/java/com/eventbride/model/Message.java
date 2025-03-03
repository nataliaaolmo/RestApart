package com.eventbride.model;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "message")
public class Message extends BaseEntity {

    @Column(name = "MessageDate", nullable = false)
    @NotBlank 
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate MessageDate;

    @Column(name = "text", nullable = false)
    @NotBlank 
    private String text;

}
