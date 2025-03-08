package com.eventbride.model;

import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.eventbride.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "students")
public class Student extends Person {

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST })
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;

    @Column(name = "is_smoker", nullable = false)
    private Boolean isSmoker;

    @Column(name = "academic_career", nullable = false)
    @NotBlank 
    private String academicCareer;

    @Column(name = "hobbies", nullable = false)
    @NotBlank 
    private String hobbies;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BookingStudent> bookingStudent;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> writtenComments;
    
}
