package com.eventbride.booking;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.student.Student;
import com.eventbride.user.User;

@Service
public class BookingService {
    private BookingRepository bookingRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Optional<Booking> findById(Integer id) {
        return bookingRepository.findById(id);
    }

    @Transactional(readOnly = true)
    List<Booking> getBookingsByStudentId(Integer currentStudentId) {
        return bookingRepository.findBookingsByStudent(currentStudentId);
    }

    @Transactional
    public Booking save(Booking booking) throws DataAccessException {
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public long countBookingsInRange(Accommodation accommodation, LocalDate startDate, LocalDate endDate) {
        return bookingRepository.countBookingsInRange(accommodation.getId(), startDate, endDate);
    }

    public List<Booking> findAllByUser(User user) {
        Student student= user.getStudent();
        return bookingRepository.findAllByUser(student);
    }


}