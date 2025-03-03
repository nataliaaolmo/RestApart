package com.eventbride.model;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "comments")
public class Comment extends BaseEntity {

    @Column(name = "comment_date", nullable = false)
    @NotNull
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate CommentDate;

    @Column(name = "text", nullable = false)
    @NotBlank 
    private String text;

    @Column(name = "rating", nullable = false)
    @NotNull
    private Integer rating;

    @ManyToOne
    @JoinColumn(name = "accommodation_id")
    private Accommodation accommodation;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    //estudiante que hace el comentario
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

}
