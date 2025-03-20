package com.eventbride.comment;
import org.springframework.data.repository.CrudRepository;

import com.eventbride.accommodation.Accommodation;

public interface CommentRepository extends CrudRepository<Comment, Integer>{

    void deleteByAccommodation(Accommodation accommodation);    
}
