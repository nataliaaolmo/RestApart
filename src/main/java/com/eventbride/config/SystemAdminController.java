package com.eventbride.config;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.AccommodationRepository;
import com.eventbride.booking.Booking;
import com.eventbride.booking.BookingRepository;
import com.eventbride.dto.UserAdminDTO;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class SystemAdminController {

    @Autowired
    private SystemStatusRepository systemStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/system/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> getSystemStatus() {
        boolean locked = systemStatusRepository.findById(1L).map(SystemStatus::isLocked).orElse(false);
        return ResponseEntity.ok(Collections.singletonMap("locked", locked));
    }

    @PutMapping("/unlock")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<String> unlockSystem() {
        SystemStatus status = systemStatusRepository.findById(1L).orElse(new SystemStatus());
        status.setLocked(false);
        systemStatusRepository.save(status);
        return ResponseEntity.ok("System unlocked.");
    }

    @PutMapping("/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> lockSystem() {
        SystemStatus status = systemStatusRepository.findById(1L).orElse(new SystemStatus());
        status.setLocked(true);
        systemStatusRepository.save(status);
        return ResponseEntity.ok("System locked.");
    }

    @GetMapping("/user-counts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getUserCounts() {
        Map<String, Integer> result = Map.of(
            "STUDENT", userRepository.countByRole("STUDENT"),
            "OWNER", userRepository.countByRole("OWNER")
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users-with-details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAdminDTO>> getAllUsersWithDetails() {
        List<User> users = userRepository.findAll();

        List<UserAdminDTO> result = users.stream().map(user -> {
            List<Accommodation> accommodations = new ArrayList<>();
            List<Booking> bookings= new ArrayList<>();

            if ("OWNER".equals(user.getRole()) && user.getOwner() != null) {
                accommodations = accommodationRepository.getAccommodationsByOwner(user.getId());
            }

            if ("STUDENT".equals(user.getRole()) && user.getStudent() != null) {
                bookings = bookingRepository.findBookingsByStudent(user.getStudent().getId());
            }

            return new UserAdminDTO(user.getId(), user.getUsername(), user.getRole(), accommodations, bookings);
        }).toList();

        return ResponseEntity.ok(result);
    }


}
