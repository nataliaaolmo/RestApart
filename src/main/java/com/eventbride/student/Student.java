package com.eventbride.student;
import com.eventbride.user.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user;

    @Column(name = "is_smoker", nullable = true)
    private Boolean isSmoker;

    @Column(name = "academic_career", nullable = true)
    private String academicCareer;

    @Column(name = "hobbies", nullable = true)
    private String hobbies;

    public Student() {}

}

