package com.eventbride.student;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends CrudRepository<Student, Integer>{

    List<Student> findAll();

    @Query("SELECT a.studentsInAccommodation FROM Accommodation a WHERE a.id = :accommodationId")
    List<Student> findStudentsByAccommodation(@Param("accommodationId") Integer accommodationId);

    @Query("SELECT s FROM Student s WHERE s.user.username = :username")
    Optional<Student> findByUserUsername(@Param("username") String username);
    
}
