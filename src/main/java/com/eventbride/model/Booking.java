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
@Table(name = "booking")
public class Booking extends BaseEntity {

    @Column(name = "link", nullable = false)
    @NotBlank 
    private String link;

    @Column(name = "title", nullable = false)
    @NotBlank 
    private String title;

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BookingStudent> bookingStudent;

}
