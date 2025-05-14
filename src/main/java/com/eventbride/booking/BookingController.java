package com.eventbride.booking;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eventbride.student.Student;
import com.eventbride.student.StudentProfileDTO;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;
import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.AccommodationRepository;
import com.eventbride.dto.BookingDTO;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.1.132:8081", "http://10.0.2.2:8081"})
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final StudentRepository studentRepository;
    private final AccommodationRepository accommodationRepository;

    @Autowired
    public BookingController(BookingService bookingService, StudentRepository studentRepository, AccommodationRepository accommodationRepository) {
        this.bookingService = bookingService;
        this.studentRepository=studentRepository;
        this.accommodationRepository = accommodationRepository;
    }

    @GetMapping
    public List<Booking> findAllBookings() {
        return bookingService.findAll();
    }

    @GetMapping("/{bookingId}/get-booking")
        public ResponseEntity<Booking> getBooking(@PathVariable Integer bookingId) {
            Booking booking = bookingService.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
            return ResponseEntity.ok(booking);
    }


    @GetMapping("/{studentId}")
    public ResponseEntity<List<BookingDTO>> findAllBookingsByStudent(@PathVariable Integer studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        List<Booking> bookings= bookingService.findAllByStudent(student);
        List<BookingDTO> dtoList = bookings.stream().map(b -> {
        return new BookingDTO(b);
    }).collect(Collectors.toList());

    return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{accommodationId}/get-accommodation-bookings")
    public List<StudentProfileDTO> findAllHistoryBookingsAccommodation(@PathVariable Integer accommodationId) {
        Accommodation accommodation = accommodationRepository.findById(accommodationId)
            .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        List<Booking> bookings= bookingService.findAllByAccommodation(accommodation);
        List<Student> students = bookings.stream()
            .map(Booking::getStudent)
            .distinct()
            .collect(Collectors.toList());
        return students.stream()
            .map(student -> new StudentProfileDTO(
                student.getUser().getFirstName(),
                student.getUser().getPhoto(), student.getId(), student.getUser().getId()
            ))
            .collect(Collectors.toList());
    }

    @PostMapping("/{accommodationId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Booking> bookAccommodation(@RequestBody @Valid Booking booking, 
                                                @AuthenticationPrincipal User currentUser, 
                                                @PathVariable Integer accommodationId) {
        Student currentStudent = studentRepository.findByUserUsername(currentUser.getUsername())
        .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        Accommodation accommodation = accommodationRepository.findById(accommodationId)
        .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        LocalDate startDate = booking.getStayRange().getStartDate();
        LocalDate endDate = booking.getStayRange().getEndDate();
    
        long existingBookings = bookingService.countBookingsInRange(accommodation, startDate, endDate);
        if (accommodation.getStudents() - existingBookings <= 0) {
            throw new RuntimeException("No hay plazas disponibles en este alojamiento para estas fechas.");
        }
        accommodation.setStudents(accommodation.getStudents() - 1);
        accommodationRepository.save(accommodation);

        Booking newBooking = new Booking();
        BeanUtils.copyProperties(booking, newBooking, "id");
    
        newBooking.setAccommodation(accommodation);
        newBooking.setStudent(currentStudent);
        newBooking.setBookingDate(LocalDate.now());
        newBooking.setStayRange(booking.getStayRange());
        newBooking.setIsVerified(false);
        
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        long monthsBetween = java.time.temporal.ChronoUnit.MONTHS.between(startDate, endDate);
        
        Double price = null;

        if (startDate.getDayOfMonth() == endDate.getDayOfMonth() && monthsBetween > 0) {
            price = monthsBetween * accommodation.getPricePerMonth();
        } else {
            price = daysBetween * accommodation.getPricePerDay();
        }

        newBooking.setPrice(price);        
    
        Booking savedBooking = bookingService.save(newBooking);
        updateAccommodationVisibility(accommodation);
        
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }

    @PostMapping("/{accommodationId}/{studentId}/register-without-account")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BookingDTO> bookForStudentWithoutAccount(
            @RequestBody @Valid Booking booking,
            @PathVariable Integer accommodationId,
            @PathVariable Integer studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Accommodation accommodation = accommodationRepository.findById(accommodationId)
                .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));

        LocalDate startDate = booking.getStayRange().getStartDate();
        LocalDate endDate = booking.getStayRange().getEndDate();

        long existingBookings = bookingService.countBookingsInRange(accommodation, startDate, endDate);
        if (accommodation.getStudents() - existingBookings <= 0) {
            throw new RuntimeException("No hay plazas disponibles");
        }

        accommodation.setStudents(accommodation.getStudents() - 1);
        accommodation.setVerifications(accommodation.getVerifications() + 1);
        accommodationRepository.save(accommodation);
        
        Booking newBooking = new Booking();
        BeanUtils.copyProperties(booking, newBooking, "id");
        newBooking.setAccommodation(accommodation);
        newBooking.setStudent(student);
        newBooking.setBookingDate(LocalDate.now());
        newBooking.setStayRange(booking.getStayRange());

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        long monthsBetween = java.time.temporal.ChronoUnit.MONTHS.between(startDate, endDate);

        double price = (startDate.getDayOfMonth() == endDate.getDayOfMonth() && monthsBetween > 0)
            ? monthsBetween * accommodation.getPricePerMonth()
            : daysBetween * accommodation.getPricePerDay();

        newBooking.setPrice(price);

        Booking savedBooking = bookingService.save(newBooking);
        updateAccommodationVisibility(accommodation);
        return new ResponseEntity<>(new BookingDTO(savedBooking), HttpStatus.CREATED);
    }


    @Transactional
    public void updateAccommodationVisibility(Accommodation accommodation) {
        long activeBookings = bookingService.countBookingsInRange(accommodation, 
            accommodation.getAvailability().getStartDate(), 
            accommodation.getAvailability().getEndDate());
    
        if (activeBookings >= accommodation.getStudents()) {
            accommodation.getAdvertisement().setIsVisible(false);
        } else {
            accommodation.getAdvertisement().setIsVisible(true);
        }
    
        accommodationRepository.save(accommodation);
    }  
    
    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable Integer bookingId,
                                                    @RequestBody BookingDTO updatedDTO) {
        Booking existing = bookingService.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        existing.getStayRange().setStartDate(updatedDTO.getStartDate());
        existing.getStayRange().setEndDate(updatedDTO.getEndDate());
        existing.setPrice(updatedDTO.getPrice());
        existing.setIsVerified(updatedDTO.getIsVerified());

        Booking saved = bookingService.save(existing);
        return ResponseEntity.ok(new BookingDTO(saved));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Integer bookingId) {
        if (!bookingService.findById(bookingId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        bookingService.deleteById(bookingId);
        return ResponseEntity.noContent().build();
    }
  
}
