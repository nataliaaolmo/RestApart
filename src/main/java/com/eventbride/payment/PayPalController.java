package com.eventbride.payment;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.AccommodationRepository;
import com.eventbride.accommodation.DateRange;
import com.eventbride.booking.Booking;
import com.eventbride.booking.BookingService;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;

@RestController
@RequestMapping("/api/payments/paypal")
public class PayPalController {

    @Autowired private BookingService bookingService;
    @Autowired private PayPalService paypalService;
    @Autowired private StudentRepository studentRepository;
    @Autowired private AccommodationRepository accommodationRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam Double amount,
            @RequestParam String currency,
            @RequestParam String description,
            @RequestParam String returnUrl) {

        String cancelUrl = "http://localhost:8081/payment-cancel";

        try {
            String approvalUrl = paypalService.createPayment(amount, currency, description, returnUrl, cancelUrl);
            return ResponseEntity.ok().body(Map.of("approvalUrl", approvalUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmAndBook(
            @RequestParam String orderId,
            @RequestParam Integer accommodationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user) {

        try {
            Map<String, Object> captureResult = paypalService.capturePayment(orderId);

            String status = (String) captureResult.get("status");
            if (!"COMPLETED".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Pago no completado");
            }

            Accommodation accommodation = accommodationRepository.findById(accommodationId)
                    .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));

            long existingBookings = bookingService.countBookingsInRange(accommodation, startDate, endDate);
            if (accommodation.getStudents() - existingBookings <= 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("No hay plazas disponibles");
            }

            Student currentStudent = studentRepository.findByUserUsername(user.getUsername())
                    .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

            Booking newBooking = new Booking();
            newBooking.setAccommodation(accommodation);
            newBooking.setStudent(currentStudent);
            newBooking.setBookingDate(LocalDate.now());
            newBooking.setStayRange(new DateRange(startDate, endDate));

            long days = ChronoUnit.DAYS.between(startDate, endDate);
            long months = ChronoUnit.MONTHS.between(startDate, endDate);

            Double price = (startDate.getDayOfMonth() == endDate.getDayOfMonth() && months > 0)
                    ? months * accommodation.getPricePerMonth()
                    : days * accommodation.getPricePerDay();

            newBooking.setPrice(price);
            bookingService.save(newBooking);

            return ResponseEntity.ok("Reserva confirmada y pagada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al confirmar pago y reservar");
        }
    }
}