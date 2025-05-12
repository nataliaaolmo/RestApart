package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.accommodation.Accommodation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccomodationDTO {
    private Integer id;
    private Integer rooms;
    private Integer beds;
    private Double pricePerDay;
    private Double pricePerMonth;
    private String description;
    private Double latitud;
    private Double longitud;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer students;
    private Boolean wifi;
    private Boolean isEasyParking;
    private Boolean isVerified;

    public AccomodationDTO() {
    }

    public AccomodationDTO(Accommodation accommodation) {
        this.id = accommodation.getId();
        this.rooms = accommodation.getRooms();
        this.beds = accommodation.getBeds();
        this.pricePerDay = accommodation.getPricePerDay();
        this.pricePerMonth = accommodation.getPricePerMonth();
        this.description = accommodation.getDescription();
        this.latitud = accommodation.getLatitud();
        this.longitud = accommodation.getLongitud();
        this.startDate = accommodation.getAvailability().getStartDate();
        this.endDate = accommodation.getAvailability().getEndDate();
        this.students = accommodation.getStudents();
        this.wifi = accommodation.getWifi();
        this.isEasyParking = accommodation.getIsEasyParking();
        this.isVerified = accommodation.getIsVerified();
    }
    
}
