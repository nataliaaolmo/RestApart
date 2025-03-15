package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;

@Service
public class AccommodationService {
    private AccommodationRepository accommodationRepository;
    private StudentRepository studentRepository;

    @Autowired
    public AccommodationService(AccommodationRepository accommodationRepository, StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
        this.accommodationRepository = accommodationRepository;
    }

    @Transactional(readOnly = true)
    public List<Accommodation> findAll() {
        return accommodationRepository.findAll();
    }

    @Transactional(readOnly = true)
    List<Accommodation> getFilteredAccommodations(Double maxPrice, LocalDate startDate, LocalDate endDate,
            Integer students, Double latitude, Double longitude, Double radius) {
        return accommodationRepository.findFilteredAccommodations(maxPrice, startDate, endDate, students, latitude, longitude, radius);
    }

    @Transactional(readOnly = true)
    public List<Accommodation> findAccommodationsByAffinity(Integer currentStudentId, Boolean matchCareer, Boolean matchSmoking, Boolean matchHobbies) {
        Student currentStudent = studentRepository.findById(currentStudentId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        List<Accommodation> visibleAccommodations = accommodationRepository.findVisibleAccommodations();
    
        // Si los 3 parámetros son false o null, se devuelven todos los alojamientos visibles sin filtrar
        if ((matchCareer == null || Boolean.FALSE.equals(matchCareer)) && 
        (matchSmoking == null || Boolean.FALSE.equals(matchSmoking)) && 
        (matchHobbies == null || Boolean.FALSE.equals(matchHobbies))) {
        return visibleAccommodations;
        }
    
    
        return visibleAccommodations.stream()
            .map(accommodation -> {
                List<Student> students = accommodation.getStudentsInAccommodation();
    
                int score = 0; // Puntuación basada en coincidencias
    
                // Si matchCareer está activado, verificamos si al menos un estudiante coincide en carrera
                if (Boolean.TRUE.equals(matchCareer) && students.stream()
                    .anyMatch(s -> s.getAcademicCareer().equals(currentStudent.getAcademicCareer()))) {
                    score++;
                }
    
                // Si matchSmoking está activado, verificamos si al menos un estudiante coincide en fumador/no fumador
                if (Boolean.TRUE.equals(matchSmoking) && students.stream()
                    .anyMatch(s -> s.getIsSmoker().equals(currentStudent.getIsSmoker()))) {
                    score++;
                }
    
                // Si matchHobbies está activado, verificamos si al menos un estudiante comparte algún hobby
                if (Boolean.TRUE.equals(matchHobbies) && students.stream()
                    .anyMatch(s -> tieneHobbyEnComun(s, currentStudent))) {
                    score++;
                }
    
                return new AccommodationScore(accommodation, score);
            })
            .filter(a -> a.getScore() > 0) // Eliminamos alojamientos sin coincidencias en los criterios activados
            .sorted((a1, a2) -> Integer.compare(a2.getScore(), a1.getScore())) // Ordenamos por mayor afinidad
            .map(AccommodationScore::getAccommodation) // Extraemos los alojamientos
            .collect(Collectors.toList());
    }
    
    // Método auxiliar para comparar hobbies entre estudiantes
    private boolean tieneHobbyEnComun(Student s, Student currentStudent) {
        List<String> hobbiesUser = Arrays.asList(currentStudent.getHobbies().split(","));
        List<String> hobbiesStudent = Arrays.asList(s.getHobbies().split(","));
        return hobbiesUser.stream().anyMatch(hobbiesStudent::contains);
    }
    
    // Clase auxiliar para ordenar los alojamientos por afinidad
    private static class AccommodationScore {
        private final Accommodation accommodation;
        private final int score;
    
        public AccommodationScore(Accommodation accommodation, int score) {
            this.accommodation = accommodation;
            this.score = score;
        }
    
        public Accommodation getAccommodation() {
            return accommodation;
        }
    
        public int getScore() {
            return score;
        }
    }
    
    
}