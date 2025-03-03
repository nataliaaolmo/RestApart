package com.eventbride.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "student")
public class Student extends Person {

    @Column(name = "isSmoker", nullable = false)
    private Boolean isSmoker;

    @Column(name = "academic_career", nullable = false)
    @NotBlank 
    private String academic_career;

    @Column(name = "hobbies", nullable = false)
    @NotBlank 
    private String hobbies;

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BookingStudent> bookingStudent;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;
}
