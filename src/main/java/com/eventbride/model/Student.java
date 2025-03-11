package com.eventbride.model;

import java.util.List;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "students")
public class Student extends Person {

    @Column(name = "is_smoker", nullable = false)
    private Boolean isSmoker;

    @Column(name = "academic_career", nullable = false)
    private String academicCareer;

    @Column(name = "hobbies", nullable = false)
    private String hobbies;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingStudent> bookingStudent;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> writtenComments;
}
