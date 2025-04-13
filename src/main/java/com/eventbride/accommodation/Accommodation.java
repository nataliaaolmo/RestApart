package com.eventbride.accommodation;

import java.util.ArrayList;
import java.util.List;

import com.eventbride.advertisement.Advertisement;
import com.eventbride.model.BaseEntity;
import com.eventbride.owner.Owner;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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

    @Column(name = "description", length = 255)
    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "accommodation_images", joinColumns = @JoinColumn(name = "accommodation_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @OneToOne(cascade = CascadeType.MERGE, optional = false, orphanRemoval = true)
    private Advertisement advertisement;    

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "user_id", nullable = false)
    private Owner owner;

}
