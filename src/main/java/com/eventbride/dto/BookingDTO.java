package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.booking.Booking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingDTO {
    private Integer id;
    private Integer studentId;
    private Integer accommodationId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate bookingDate;
    private Double price;
    private String bookingName;
    private Boolean isVerified;

    public BookingDTO(Booking booking) {
        this.id = booking.getId();
        this.studentId = booking.getStudent().getId();
        this.accommodationId = booking.getAccommodation().getId();
        this.startDate = booking.getStayRange().getStartDate();
        this.endDate = booking.getStayRange().getEndDate();
        this.bookingDate = booking.getBookingDate();
        this.price = booking.getPrice();
        this.bookingName = booking.getAccommodation().getAdvertisement().getTitle();
        this.isVerified = booking.getIsVerified();
    }
}
