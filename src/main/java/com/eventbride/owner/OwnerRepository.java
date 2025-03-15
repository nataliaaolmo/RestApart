package com.eventbride.owner;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface OwnerRepository extends CrudRepository<Owner, Integer>{

    List<Owner> findAll();

    @Query("SELECT o FROM Owner o WHERE o.user.username = :username")
    Optional<Owner> findByUserUsername(@Param("username") String username);
    
}
