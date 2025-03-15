package com.eventbride.owner;

import java.util.List;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.model.Person;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "owners")
public class Owner extends Person {

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Accommodation> accommodations;
}
