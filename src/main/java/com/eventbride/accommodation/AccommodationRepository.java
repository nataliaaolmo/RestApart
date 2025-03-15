package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;


public interface AccommodationRepository extends CrudRepository<Accommodation, Integer>{

    List<Accommodation> findAll();

    @Query("SELECT a FROM Accommodation a WHERE a.advertisement.isVisible = true")
    List<Accommodation> findVisibleAccommodations();

    @Query("SELECT a FROM Accommodation a " +
    "WHERE (:maxPrice IS NULL OR a.pricePerMonth <= :maxPrice) " +
    "AND (:startDate IS NULL OR a.availability.startDate <= :startDate) " +
    "AND (:endDate IS NULL OR a.availability.endDate >= :endDate) " +
    "AND (:students IS NULL OR a.students >= :students) " +
    "AND (6371 * acos(" +
    "       cos(radians(:latitude)) * cos(radians(a.latitud)) * " +
    "       cos(radians(a.longitud) - radians(:longitude)) + " +
    "       sin(radians(:latitude)) * sin(radians(a.latitud))" +
    "   ) <= :radius)"
    )
    List<Accommodation> findFilteredAccommodations(
        @Param("maxPrice") Double maxPrice, 
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate, 
        @Param("students") Integer students,
        @Param("latitude") Double latitude, 
        @Param("longitude") Double longitude,
        @Param("radius") Double radius
);


    
}
