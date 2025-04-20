package com.eventbride.comment;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.user.User;

public interface CommentRepository extends CrudRepository<Comment, Integer>{

    void deleteByAccommodation(Accommodation accommodation);  
    
    List<Comment> findAll();

    @Query("SELECT c FROM Comment c WHERE c.accommodation = :accommodation")
    List<Comment> findAllByAccommodation(Accommodation accommodation);   

    @Query("SELECT c FROM Comment c WHERE c.user = :user")
    List<Comment> findAllByUser(User user); 

    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.accommodation = :accommodation")
    Double averageRatingPerAccommodation(Accommodation accommodation);

    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.user = :user")
    Double averageRatingPerUser(User user);
}
