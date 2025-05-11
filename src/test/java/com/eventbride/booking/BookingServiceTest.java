package com.eventbride.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.student.Student;


public class BookingServiceTest {
    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;
    
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll_shouldReturnAllBookings() {
        Booking b1 = new Booking();
        b1.setId(1);
        Booking b2 = new Booking();
        b2.setId(2);
        when(bookingRepository.findAll()).thenReturn(List.of(b1, b2));

        List<Booking> result = bookingService.findAll();

        assertEquals(2, result.size());
        verify(bookingRepository).findAll();
    }

    @Test
    void testFindById_existingBooking_shouldReturnBooking() {
        Booking booking = new Booking();
        booking.setId(1);

        when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

        Optional<Booking> result = bookingService.findById(1);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
        verify(bookingRepository).findById(1);
    }

    @Test
    void testFindById_nonExistingBooking_shouldReturnEmptyOptional() {
        when(bookingRepository.findById(99)).thenReturn(Optional.empty());

        Optional<Booking> result = bookingService.findById(99);

        assertTrue(result.isEmpty());
        verify(bookingRepository).findById(99);
    }

    @Test
    void testGetBookingsByStudentId_existingStudent_shouldReturnBookings() {
        Booking b1 = new Booking();
        b1.setId(1);
        Booking b2 = new Booking();
        b2.setId(2);

        when(bookingRepository.findBookingsByStudent(10)).thenReturn(List.of(b1, b2));

        List<Booking> result = bookingService.getBookingsByStudentId(10);

        assertEquals(2, result.size());
        verify(bookingRepository).findBookingsByStudent(10);
    }

    @Test
    void testGetBookingsByStudentId_noBookings_shouldReturnEmptyList() {
        when(bookingRepository.findBookingsByStudent(999)).thenReturn(List.of());

        List<Booking> result = bookingService.getBookingsByStudentId(999);

        assertTrue(result.isEmpty());
        verify(bookingRepository).findBookingsByStudent(999);
    }

    @Test
    void testSave_validBooking_shouldReturnSavedBooking() {
        Booking booking = new Booking();
        booking.setId(10);

        when(bookingRepository.save(booking)).thenReturn(booking);

        Booking result = bookingService.save(booking);

        assertNotNull(result);
        assertEquals(10, result.getId());
        verify(bookingRepository).save(booking);
    }

    @Test
    void testSave_bookingThrowsException_shouldPropagate() {
        Booking booking = new Booking();
        when(bookingRepository.save(booking)).thenThrow(new DataIntegrityViolationException("Error BD"));

        assertThrows(DataIntegrityViolationException.class, () ->
            bookingService.save(booking)
        );

        verify(bookingRepository).save(booking);
    }

    @Test
    void testCountBookingsInRange_shouldReturnCorrectCount() {
        Accommodation acc = new Accommodation();
        acc.setId(5);

        LocalDate start = LocalDate.of(2025, 5, 1);
        LocalDate end = LocalDate.of(2025, 5, 31);

        when(bookingRepository.countBookingsInRange(5, start, end)).thenReturn(3L);

        long count = bookingService.countBookingsInRange(acc, start, end);

        assertEquals(3L, count);
        verify(bookingRepository).countBookingsInRange(5, start, end);
    }

    @Test
    void testCountBookingsInRange_repositoryThrowsException_shouldPropagate() {
        Accommodation acc = new Accommodation();
        acc.setId(99);

        LocalDate start = LocalDate.of(2025, 6, 1);
        LocalDate end = LocalDate.of(2025, 6, 30);

        when(bookingRepository.countBookingsInRange(99, start, end))
            .thenThrow(new InvalidDataAccessResourceUsageException("Error al acceder a la BD"));

        assertThrows(InvalidDataAccessResourceUsageException.class, () ->
            bookingService.countBookingsInRange(acc, start, end)
        );

        verify(bookingRepository).countBookingsInRange(99, start, end);
    }


    @Test
    void testFindAllByUser_studentWithBookings_shouldReturnList() {
        Student student = new Student();
        student.setId(2);


        Booking b1 = new Booking();
        Booking b2 = new Booking();

        when(bookingRepository.findAllByStudent(student)).thenReturn(List.of(b1, b2));

        List<Booking> result = bookingService.findAllByStudent(student);

        assertEquals(2, result.size());
        verify(bookingRepository).findAllByStudent(student);
    }

    @Test
    void testFindAllByUser_studentWithoutBookings_shouldReturnEmptyList() {
        Student student = new Student();
        student.setId(3);

        when(bookingRepository.findAllByStudent(student)).thenReturn(List.of());

        List<Booking> result = bookingService.findAllByStudent(student);

        assertTrue(result.isEmpty());
        verify(bookingRepository).findAllByStudent(student);
    }
}
