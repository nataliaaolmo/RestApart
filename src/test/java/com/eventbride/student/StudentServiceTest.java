package com.eventbride.student;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataRetrievalFailureException;

public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;
    
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll_shouldReturnAllStudents() {
        Student s1 = new Student();
        s1.setId(1);
        Student s2 = new Student();
        s2.setId(2);

        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));

        List<Student> result = studentService.findAll();

        assertEquals(2, result.size());
        verify(studentRepository).findAll();
    }

    @Test
    void testFindAll_repositoryThrowsException_shouldPropagate() {
        when(studentRepository.findAll())
            .thenThrow(new DataRetrievalFailureException("Error al acceder a estudiantes"));
            
        assertThrows(DataRetrievalFailureException.class, () ->
            studentService.findAll()
        );

        verify(studentRepository).findAll();
    }
}
