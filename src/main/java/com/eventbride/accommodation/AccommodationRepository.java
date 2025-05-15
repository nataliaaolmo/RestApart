package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.eventbride.student.Student;


public interface AccommodationRepository extends CrudRepository<Accommodation, Integer>{

    List<Accommodation> findAll();

    @Query("SELECT a FROM Accommodation a WHERE a.advertisement.isVisible = true")
    List<Accommodation> findVisibleAccommodations();

@Query("""
    SELECT a FROM Accommodation a
    WHERE
        a.pricePerMonth <= COALESCE(:maxPrice, a.pricePerMonth)
        AND a.availability.startDate <= COALESCE(:startDate, a.availability.startDate)
        AND a.availability.endDate >= COALESCE(:endDate, a.availability.endDate)
        AND (
            COALESCE(:students, 0) = 0
            OR (
                a.students - (
                    SELECT COUNT(b) FROM Booking b
                    WHERE b.accommodation = a
                    AND b.stayRange.startDate < COALESCE(:endDate, b.stayRange.startDate)
                    AND b.stayRange.endDate > COALESCE(:startDate, b.stayRange.endDate)
                )
            ) >= :students
        )
        AND a.advertisement.isVisible = true
""")
List<Accommodation> findFilteredAccommodationsBase(
    @Param("maxPrice") Double maxPrice,
    @Param("startDate") LocalDate startDate,
    @Param("endDate") LocalDate endDate,
    @Param("students") Integer students
);

   

    @Query("SELECT DISTINCT b.student FROM Booking b WHERE b.accommodation.id = :accommodationId " +
        "AND b.stayRange.startDate < :endDate " + 
        "AND b.stayRange.endDate > :startDate") 
    List<Student> findStudentsInAccommodationForDateRange(@Param("accommodationId") Integer accommodationId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Accommodation a WHERE a.owner.user.id = :id")
    List<Accommodation> getAccommodationsByOwner(@Param("id") Integer id);
                                                          
}
