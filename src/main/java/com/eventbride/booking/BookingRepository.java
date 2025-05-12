package com.eventbride.booking;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.student.Student;

public interface BookingRepository extends CrudRepository<Booking, Integer>{

    List<Booking> findAll();

    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId")
    List<Booking> findBookingsByStudent(Integer studentId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.accommodation.id = :accommodationId " +
        "AND b.stayRange.startDate < :endDate " +
        "AND b.stayRange.endDate > :startDate")
    long countBookingsInRange(@Param("accommodationId") Integer accommodationId, 
                            @Param("startDate") LocalDate startDate, 
                            @Param("endDate") LocalDate endDate);

    void deleteByAccommodation(Accommodation accommodation);

    @Query("SELECT b FROM Booking b WHERE b.student = :student")
    List<Booking> findAllByStudent(Student student);

    @Query("SELECT b FROM Booking b WHERE b.accommodation = :accommodation")
    List<Booking> findAllByAccommodation(Accommodation accommodation);

}
