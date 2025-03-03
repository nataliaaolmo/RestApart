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
@Table(name = "comment")
public class Comment extends BaseEntity {

    @Column(name = "CommentDate", nullable = false)
    @NotBlank 
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate CommentDate;

    @Column(name = "text", nullable = false)
    @NotBlank 
    private String text;

    @Column(name = "rating", nullable = false)
    @NotBlank 
    private Integer rating;

}
