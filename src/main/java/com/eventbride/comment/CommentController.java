package com.eventbride.comment;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.eventbride.student.Student;
import com.eventbride.user.User;
import com.eventbride.user.UserService;
import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.AccommodationService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.1.132:8081", "http://10.0.2.2:8081"})
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final AccommodationService accommodationService;
    private final UserService userService;


    @Autowired
    public CommentController(CommentService commentService, AccommodationService accommodationService, UserService userService) {
        this.commentService = commentService;
        this.accommodationService = accommodationService;
        this.userService = userService;
    }

    @GetMapping
    public List<Comment> findAllcomments() {
        return commentService.findAll();
    }

    @GetMapping("/accomodations/{accommodationId}")
    public List<Comment> findAllcommentsByAccommodation(@PathVariable Integer accommodationId) {
        Accommodation accommodation = accommodationService.findById(accommodationId)
        .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        return commentService.findAllByAccommodation(accommodation);
    }

    @GetMapping("/users/{userId}")
    public List<Comment> findAllcommentsByUser(@PathVariable Integer userId) {
        User user = userService.getUserById(userId).get();
        return commentService.findAllByUser(user);
    }

    @GetMapping("/accomodations/{accommodationId}/average")
    public Double averageRatingPerAccommodation(@PathVariable Integer accommodationId) {
        Accommodation accommodation = accommodationService.findById(accommodationId)
        .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        return commentService.averageRatingPerAccommodation(accommodation);
    }

    @GetMapping("/users/{userId}/average")
    public Double averageRatingPerUser(@PathVariable Integer userId) {
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return commentService.averageRatingPerUser(user);
    }

    @PostMapping("/accomodations/{accommodationId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Comment> commentAccommodation(@RequestBody @Valid Comment comment, 
                                                @AuthenticationPrincipal User currentUser, 
                                                @PathVariable Integer accommodationId) {

        Student currentStudent = currentUser.getStudent();
        Accommodation accommodation = accommodationService.findById(accommodationId)
        .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));

        Comment newcomment = new Comment();
        BeanUtils.copyProperties(comment, newcomment, "id");
    
        newcomment.setCommentDate(LocalDate.now());
        newcomment.setText(comment.getText());
        newcomment.setRating(comment.getRating());
        newcomment.setAccommodation(accommodation);
        newcomment.setStudent(currentStudent);
        newcomment.setUser(null);   
    
        Comment savedcomment = commentService.save(newcomment); 
        return new ResponseEntity<>(savedcomment, HttpStatus.CREATED);
    }  

    @PostMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Comment> commentUser(@RequestBody @Valid Comment comment, 
                                                @AuthenticationPrincipal User currentUser, 
                                                @PathVariable Integer userId) {

        Student currentStudent = currentUser.getStudent();
        User user = userService.getUserById(userId).get();

        Comment newcomment = new Comment();
        BeanUtils.copyProperties(comment, newcomment, "id");   
        newcomment.setCommentDate(LocalDate.now());
        newcomment.setText(comment.getText());
        newcomment.setRating(comment.getRating());
        newcomment.setAccommodation(null);
        newcomment.setStudent(currentStudent);
        newcomment.setUser(user);      
        Comment savedcomment = commentService.save(newcomment);   
        return new ResponseEntity<>(savedcomment, HttpStatus.CREATED);
    }  
    
}
