package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/accommodations")
public class AccommodationController {

    private final AccommodationService accommodationService;
    private final StudentRepository studentRepository;

    @Autowired
    public AccommodationController(AccommodationService accommodationService, StudentRepository studentRepository) {
        this.accommodationService = accommodationService;
        this.studentRepository=studentRepository;
    }

    @GetMapping
    public List<Accommodation> findAllAccommodations() {
        return accommodationService.findAll();
    }

    @GetMapping("/search")
    public List<Accommodation> findFilteredAccommodations(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Integer students,
            @RequestParam(required = false) Boolean wifi,
            @RequestParam(required = false) Boolean isEasyParking,
            @RequestParam(required = false) Boolean matchCareer,
            @RequestParam(required = false) Boolean matchHobbies,
            @RequestParam(required = false) Boolean matchSmoking,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radius) {
    
        System.out.println("✅ Usuario autenticado: " + currentUser.getUsername());
        Student currentStudent = studentRepository.findByUserUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        // Obtener los alojamientos que coinciden por afinidad
        List<Accommodation> accommodationsByAffinity = accommodationService.findAccommodationsByAffinity(
                currentStudent.getId(), matchCareer, matchSmoking, matchHobbies);
    
        // Obtener los alojamientos que cumplen los filtros de búsqueda
        List<Accommodation> filteredAccommodations = accommodationService.getFilteredAccommodations(
                maxPrice, startDate, endDate, students, latitude, longitude, radius);
    
        // Convertimos las listas a Sets de IDs para una comparación eficiente
        Set<Integer> affinityAccommodationIds = accommodationsByAffinity.stream()
                .map(Accommodation::getId)
                .collect(Collectors.toSet());
    
        // 🔥 Nuevo filtrado: comparar por IDs en lugar de objetos completos
        if (accommodationsByAffinity.isEmpty()) {
            return filteredAccommodations; // Si no hay afinidades, devolvemos los filtrados
        } else {
            return filteredAccommodations.stream()
                    .filter(a -> affinityAccommodationIds.contains(a.getId())) // Comparar por ID
                    .collect(Collectors.toList());
        }
    }
    
    
}
