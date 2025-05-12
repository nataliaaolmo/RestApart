package com.eventbride.dto;

import java.util.List;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.booking.Booking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAdminDTO {
    Integer id;
    String username;
    String role;
    List<Accommodation> accommodations;
    List<Booking> bookings;

    public UserAdminDTO(Integer id, String username, String role, List<Accommodation> accommodations, List<Booking> bookings) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.accommodations = accommodations;
        this.bookings = bookings;
    }
}

