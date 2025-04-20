package com.eventbride.comment;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.user.User;

@Service
public class CommentService {
    private CommentRepository commentRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<Comment> findAll() {
        return commentRepository.findAll();
    }

    @Transactional
    public Optional<Comment> findById(Integer id) {
        return commentRepository.findById(id);
    }

    @Transactional
    public Comment save(Comment comment) throws DataAccessException {
        return commentRepository.save(comment);
    }

    public List<Comment> findAllByAccommodation(Accommodation accommodation) {
        return commentRepository.findAllByAccommodation(accommodation);
    }
    public List<Comment> findAllByUser(User user) {
        return commentRepository.findAllByUser(user);
    }

    public Double averageRatingPerAccommodation(Accommodation accommodation) {
        return commentRepository.averageRatingPerAccommodation(accommodation);
    }
    public Double averageRatingPerUser(User user) {
        return commentRepository.averageRatingPerUser(user);
    }

}