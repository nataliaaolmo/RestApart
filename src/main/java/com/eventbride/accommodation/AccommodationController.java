package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;
import com.eventbride.advertisement.Advertisement;
import com.eventbride.advertisement.AdvertisementService;
import com.eventbride.owner.Owner;
import com.eventbride.owner.OwnerRepository;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/accommodations")
public class AccommodationController {

    private final AccommodationService accommodationService;
    private final StudentRepository studentRepository;
    private final OwnerRepository ownerRepository;
    private final AdvertisementService advertisementService;

    @Autowired
    public AccommodationController(AccommodationService accommodationService, StudentRepository studentRepository, OwnerRepository ownerRepository, AdvertisementService advertisementService) {
        this.accommodationService = accommodationService;
        this.studentRepository=studentRepository;
        this.ownerRepository = ownerRepository;
        this.advertisementService = advertisementService;
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

        Student currentStudent = studentRepository.findByUserUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        List<Accommodation> accommodationsByAffinity = accommodationService.findAccommodationsByAffinity(
                currentStudent.getId(), matchCareer, matchSmoking, matchHobbies);

        List<Accommodation> filteredAccommodations = accommodationService.getFilteredAccommodations(
                maxPrice, startDate, endDate, students, latitude, longitude, radius);
    
        Set<Integer> affinityAccommodationIds = accommodationsByAffinity.stream()
                .map(Accommodation::getId)
                .collect(Collectors.toSet());

        return filteredAccommodations.stream()
                    .filter(a -> affinityAccommodationIds.contains(a.getId()))
                    .collect(Collectors.toList());
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Accommodation> create(@RequestBody @Valid Accommodation accommodation, 
                                                @AuthenticationPrincipal User currentUser, 
                                                @RequestParam String title) {
        Owner currentOwner = ownerRepository.findByUserUsername(currentUser.getUsername())
            .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));
    
        Advertisement advertisement = new Advertisement();
        advertisement.setIsVisible(true);
        advertisement.setTitle(title);
        advertisement = advertisementService.save(advertisement); 
    
        Accommodation newAccommodation = new Accommodation();
        BeanUtils.copyProperties(accommodation, newAccommodation, "id");
    
        newAccommodation.setAdvertisement(advertisement);
        newAccommodation.setOwner(currentOwner);
    
        Accommodation savedAccommodation = accommodationService.save(newAccommodation);
        
        return new ResponseEntity<>(savedAccommodation, HttpStatus.CREATED);
    }
    
    @PutMapping("{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Accommodation> associateStudentToAccommodation(@PathVariable Integer id, @RequestBody @Valid Student student) {
        Accommodation accommodation = accommodationService.findById(id)
            .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
    
        // Buscar el estudiante desde la BD para evitar problemas de transacciones
        Student existingStudent = studentRepository.findById(student.getId())
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        List<Student> studentsInAccommodation = accommodation.getStudentsInAccommodation();
        studentsInAccommodation.add(existingStudent); // Usar el estudiante de la BD
    
        accommodation.setStudentsInAccommodation(studentsInAccommodation);
    
        Accommodation savedAccommodation = accommodationService.save(accommodation);
        
        return new ResponseEntity<>(savedAccommodation, HttpStatus.OK);
    }
    
    
}
