package com.eventbride.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @Column(name = "link", nullable = false)
    @NotBlank 
    private String link;

    @Column(name = "title", nullable = false)
    @NotBlank 
    private String title;

    @ManyToOne
    @JoinColumn(name = "advertisement_id", nullable = false)
    private Advertisement advertisement;

}
