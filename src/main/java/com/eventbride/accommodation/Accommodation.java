package com.eventbride.accommodation;

import java.util.List;

import com.eventbride.advertisement.Advertisement;
import com.eventbride.comment.Comment;
import com.eventbride.model.BaseEntity;
import com.eventbride.owner.Owner;
import com.eventbride.student.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "accommodations")
public class Accommodation extends BaseEntity {

    @Column(name = "rooms", nullable = false)
    @NotNull
    @Positive
    private Integer rooms;

    @Column(name = "beds", nullable = false)
    @NotNull
    @Positive
    private Integer beds;

    @Column(name = "price_per_day", nullable = false)
    @NotNull
    @Positive
    private Double pricePerDay;

    @Column(name = "price_per_month", nullable = false)
    @NotNull
    @Positive
    private Double pricePerMonth;

    @Column(name = "description", nullable = false)
    @NotBlank
    private String description;

    @Column(name = "latitud", nullable = false, unique = true)
    @NotNull
    private Double latitud;

	@Column(name = "longitud", nullable = false, unique = true)
    @NotNull
    private Double longitud;

    @Embedded
    @NotNull(message = "La disponibilidad no puede estar vacía")
    private DateRange availability;

	@Column(name = "students", nullable = false)
    @NotNull 
    private Integer students;

    @Column(name = "wifi", nullable = false)
    private Boolean wifi;

    @Column(name = "is_easy_parking", nullable = false)
    private Boolean isEasyParking;

    @JsonIgnore
    @OneToOne(cascade = CascadeType.MERGE, optional = false)
    private Advertisement advertisement;    

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
    private Owner owner;

    @JsonIgnore
    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "accommodation_id")
    private List<Student> studentsInAccommodation;


}
