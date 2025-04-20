package com.eventbride.comment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.user.User;

public class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;
    
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll_shouldReturnAllComments() {
        Comment c1 = new Comment();
        c1.setId(1);
        Comment c2 = new Comment();
        c2.setId(2);

        when(commentRepository.findAll()).thenReturn(List.of(c1, c2));

        List<Comment> result = commentService.findAll();

        assertEquals(2, result.size());
        verify(commentRepository).findAll();
    }

 
    @Test
    void testFindAll_repositoryThrowsException_shouldPropagate() {
        when(commentRepository.findAll())
            .thenThrow(new DataAccessResourceFailureException("Fallo en el acceso a la BD"));
    
        assertThrows(DataAccessResourceFailureException.class, () ->
            commentService.findAll()
        );
    
        verify(commentRepository).findAll();
    }

    @Test
    void testFindById_existingComment_shouldReturnComment() {
        Comment comment = new Comment();
        comment.setId(1);

        when(commentRepository.findById(1)).thenReturn(Optional.of(comment));

        Optional<Comment> result = commentService.findById(1);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
        verify(commentRepository).findById(1);
    }

    @Test
    void testFindById_nonExistingComment_shouldReturnEmptyOptional() {
        when(commentRepository.findById(99)).thenReturn(Optional.empty());

        Optional<Comment> result = commentService.findById(99);

        assertTrue(result.isEmpty());
        verify(commentRepository).findById(99);
    }

    @Test
    void testSave_validComment_shouldReturnSavedComment() {
        Comment comment = new Comment();
        comment.setId(10);
        comment.setText("Muy buen alojamiento");

        when(commentRepository.save(comment)).thenReturn(comment);

        Comment result = commentService.save(comment);

        assertNotNull(result);
        assertEquals(10, result.getId());
        verify(commentRepository).save(comment);
    }

    @Test
    void testSave_invalidComment_shouldThrowException() {
        Comment comment = new Comment();

        when(commentRepository.save(comment))
            .thenThrow(new DataIntegrityViolationException("Error al guardar comentario"));

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.save(comment)
        );

        verify(commentRepository).save(comment);
    }

    @Test
    void testFindAllByAccommodation_existingAccommodation_shouldReturnComments() {
        Accommodation acc = new Accommodation();
        acc.setId(1);

        Comment c1 = new Comment();
        c1.setId(1);
        Comment c2 = new Comment();
        c2.setId(2);

        when(commentRepository.findAllByAccommodation(acc)).thenReturn(List.of(c1, c2));

        List<Comment> result = commentService.findAllByAccommodation(acc);

        assertEquals(2, result.size());
        verify(commentRepository).findAllByAccommodation(acc);
    }

    @Test
    void testFindAllByAccommodation_repositoryThrowsException_shouldPropagate() {
        Accommodation acc = new Accommodation();
        acc.setId(99);

        when(commentRepository.findAllByAccommodation(acc))
            .thenThrow(new DataAccessException("Fallo al buscar por alojamiento") {});

        assertThrows(DataAccessException.class, () ->
            commentService.findAllByAccommodation(acc)
        );

        verify(commentRepository).findAllByAccommodation(acc);
    }

    @Test
    void testFindAllByUser_existingUser_shouldReturnComments() {
        User user = new User();
        user.setId(1);

        Comment c1 = new Comment();
        c1.setId(1);

        when(commentRepository.findAllByUser(user)).thenReturn(List.of(c1));

        List<Comment> result = commentService.findAllByUser(user);

        assertEquals(1, result.size());
        verify(commentRepository).findAllByUser(user);
    }

    @Test
    void testFindAllByUser_repositoryThrowsException_shouldPropagate() {
        User user = new User();
        user.setId(99);

        when(commentRepository.findAllByUser(user))
            .thenThrow(new DataAccessException("Error de consulta") {});

        assertThrows(DataAccessException.class, () ->
            commentService.findAllByUser(user)
        );

        verify(commentRepository).findAllByUser(user);
    }

    @Test
    void testAverageRatingPerAccommodation_existingAccommodation_shouldReturnAverage() {
        Accommodation acc = new Accommodation();
        acc.setId(1);

        when(commentRepository.averageRatingPerAccommodation(acc)).thenReturn(4.2);

        Double average = commentService.averageRatingPerAccommodation(acc);

        assertNotNull(average);
        assertEquals(4.2, average);
        verify(commentRepository).averageRatingPerAccommodation(acc);
    }

    @Test
    void testAverageRatingPerAccommodation_repositoryThrowsException_shouldPropagate() {
        Accommodation acc = new Accommodation();
        acc.setId(99);

        when(commentRepository.averageRatingPerAccommodation(acc))
            .thenThrow(new DataAccessException("Error al calcular media") {});

        assertThrows(DataAccessException.class, () ->
            commentService.averageRatingPerAccommodation(acc)
        );

        verify(commentRepository).averageRatingPerAccommodation(acc);
    }

    @Test
    void testAverageRatingPerUser_existingUser_shouldReturnAverage() {
        User user = new User();
        user.setId(1);

        when(commentRepository.averageRatingPerUser(user)).thenReturn(3.8);

        Double average = commentService.averageRatingPerUser(user);

        assertNotNull(average);
        assertEquals(3.8, average);
        verify(commentRepository).averageRatingPerUser(user);
    }

    @Test
    void testAverageRatingPerUser_repositoryThrowsException_shouldPropagate() {
        User user = new User();
        user.setId(999);
    
        when(commentRepository.averageRatingPerUser(user))
            .thenThrow(new DataAccessException("Error al calcular media del usuario") {});
    
        assertThrows(DataAccessException.class, () ->
            commentService.averageRatingPerUser(user)
        );
    
        verify(commentRepository).averageRatingPerUser(user);
    }
}
