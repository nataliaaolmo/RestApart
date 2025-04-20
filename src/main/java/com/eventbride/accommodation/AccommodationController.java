package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.eventbride.student.StudentProfileDTO;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;
import com.eventbride.advertisement.Advertisement;
import com.eventbride.advertisement.AdvertisementService;
import com.eventbride.booking.BookingService;
import com.eventbride.owner.Owner;
import com.eventbride.owner.OwnerRepository;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.1.132:8081", "http://10.0.2.2:8081"})
@RestController
@RequestMapping("/api/accommodations")
public class AccommodationController {

    private final AccommodationService accommodationService;
    private final StudentRepository studentRepository;
    private final OwnerRepository ownerRepository;
    private final AdvertisementService advertisementService;
    private final BookingService bookingService;

    @Autowired
    public AccommodationController(AccommodationService accommodationService, StudentRepository studentRepository, OwnerRepository ownerRepository, AdvertisementService advertisementService, BookingService bookingService) {
        this.accommodationService = accommodationService;
        this.studentRepository=studentRepository;
        this.ownerRepository = ownerRepository;
        this.advertisementService = advertisementService;
        this.bookingService=bookingService;
    }

    @GetMapping
    public List<Accommodation> findAllAccommodations() {
        return accommodationService.findAll();
    }

    @GetMapping("/{accommodationId}")
    public Accommodation findAccommodationById(@PathVariable Integer accommodationId) {
        return accommodationService.findById(accommodationId).get();
    }

    @GetMapping("/{accommodationId}/students")
    public List<StudentProfileDTO> getStudentsForAccommodationInRange(
        @PathVariable Integer accommodationId,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate
    ) {
        Accommodation accommodation = accommodationService.findById(accommodationId)
            .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        
        List<Student> students = accommodationService.getStudentsInAccommodationForDateRange(accommodation, startDate, endDate);
        
        return students.stream()
            .map(student -> new StudentProfileDTO(
                student.getUser().getFirstName(),
                student.getUser().getPhoto(), student.getUser().getId()
            ))
            .collect(Collectors.toList());
    }

    @GetMapping("/owner-accomodations")
    public List<Accommodation> getAccommodationsByOwner(@AuthenticationPrincipal User currentUser) {
        Owner currentOwner = ownerRepository.findByUserUsername(currentUser.getUsername())
        .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));
        return accommodationService.getAccommodationsByOwner(currentOwner.getId());
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
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius) {

        Student currentStudent = studentRepository.findByUserUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        List<Accommodation> accommodationsByAffinity = accommodationService.findAccommodationsByAffinity(
                currentStudent.getId(), matchCareer, matchSmoking, matchHobbies, startDate, endDate);

        List<Accommodation> filteredAccommodations = accommodationService.getFilteredAccommodations(
                maxPrice, startDate, endDate, students, latitude, longitude, radius, wifi, isEasyParking);
        Set<Integer> filteredIds = filteredAccommodations.stream()
        .map(Accommodation::getId)
        .collect(Collectors.toSet());

        return accommodationsByAffinity.stream()
        .filter(a -> filteredIds.contains(a.getId()))
        .collect(Collectors.toList());
    }

    @GetMapping("/{id}/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
        @PathVariable Integer id,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate
    ) {
        Accommodation acc = accommodationService.findById(id)
            .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));
        long count = bookingService.countBookingsInRange(acc, startDate, endDate);
        boolean available = acc.getStudents() > count;
        return ResponseEntity.ok(available);
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

	@PutMapping("/{id}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody Accommodation updatedAccommodation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
    
            if (roles.contains("OWNER")) {
                try {
                    Optional<Accommodation> existingAccommodationOptional = accommodationService.findById(id);
                    if (existingAccommodationOptional.isEmpty()) {
                        return new ResponseEntity<>("Apartamento no encontrado", HttpStatus.NOT_FOUND);
                    }
                    updatedAccommodation.setId(id);
                    Accommodation savedAccommodation = accommodationService.update(id, updatedAccommodation);
                    return new ResponseEntity<>(savedAccommodation, HttpStatus.OK);
                } catch (RuntimeException e) {
                    return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
                }
            }
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable Integer id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		if (roles.contains("OWNER")) {
			accommodationService.delete(id);
			return new ResponseEntity<>("Borrado correctamente", HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

    
}
