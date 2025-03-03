package com.eventbride.model;

import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
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
    @NotBlank 
    private Integer rooms;

    @Column(name = "beds", nullable = false)
    @NotBlank 
    private Integer beds;

    @Column(name = "price_per_day", nullable = false)
    @NotBlank 
    @Positive
    private Double pricePerDay;

    @Column(name = "price_per_month", nullable = false)
    @NotBlank 
    @Positive
    private Double pricePerMonth;

    @Column(name = "description", nullable = false)
    @NotBlank
    private String description;

    @Column(name = "latitud", nullable = false, unique = true)
    @NotBlank
    private String latitud;

	@Column(name = "longitud", nullable = false, unique = true)
    @NotBlank
    private String longitud;

    @Embedded
    private DateRange availability;

	@Column(name = "students", nullable = false)
    @NotNull 
    private Integer students;

    @Column(name = "wifi", nullable = false)
    private Boolean wifi;

    @Column(name = "is_easy_parking", nullable = false)
    private Boolean isEasyParking;

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST })
	@JoinColumn(name = "advertisementId", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Advertisement advertisement;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
    private Owner owner;

    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

}
