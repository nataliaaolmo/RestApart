package com.eventbride.owner;

import java.util.List;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.model.Person;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "owners")
@Getter
@Setter
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;
}

