package com.eventbride.accommodation;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.eventbride.booking.BookingRepository;
import com.eventbride.comment.CommentRepository;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;

@Service
public class AccommodationService {
    private AccommodationRepository accommodationRepository;
    private StudentRepository studentRepository;
    private BookingRepository bookingRepository;
    private CommentRepository commentRepository;

    @Autowired
    public AccommodationService(AccommodationRepository accommodationRepository, StudentRepository studentRepository, BookingRepository bookingRepository, CommentRepository commentRepository) {
        this.studentRepository = studentRepository;
        this.accommodationRepository = accommodationRepository;
        this.bookingRepository = bookingRepository;
        this.commentRepository= commentRepository;
    }

    @Transactional(readOnly = true)
    public List<Accommodation> findAll() {
        return accommodationRepository.findAll();
    }

    @Transactional
    public Optional<Accommodation> findById(Integer id) {
        return accommodationRepository.findById(id);
    }

    public List<Accommodation> getFilteredAccommodations(
        Double maxPrice, LocalDate startDate, LocalDate endDate,
        Integer students, Double latitude, Double longitude, Double radius, Boolean wifi, Boolean parking) {

    List<Accommodation> baseFiltered = accommodationRepository.findFilteredAccommodationsBase(
        maxPrice, startDate, endDate, students
    );

    if(wifi != null && wifi) {
        baseFiltered = baseFiltered.stream()
            .filter(a -> a.getWifi() != null && a.getWifi())
            .collect(Collectors.toList());
    }
    if(parking != null && parking) {
        baseFiltered = baseFiltered.stream()
            .filter(a -> a.getIsEasyParking() != null && a.getIsEasyParking())
            .collect(Collectors.toList());
    }  

    if (latitude == null || longitude == null || radius == null) {
        return baseFiltered;
    }

    List<Accommodation> result = new ArrayList<Accommodation>();

    for (Accommodation acc : baseFiltered) {
        double distance = haversineDistance(latitude, longitude,
                acc.getLatitud(), acc.getLongitud());
        if (distance <= radius) {
            result.add(acc);
        }
    }

    return result;
}

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radio de la Tierra en km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }   

    @Transactional(readOnly = true)
    public List<Accommodation> findAccommodationsByAffinity(Integer currentStudentId, Boolean matchCareer, Boolean matchSmoking, Boolean matchHobbies, LocalDate startDate, LocalDate endDate) {
        Student currentStudent = studentRepository.findById(currentStudentId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    
        List<Accommodation> visibleAccommodations = accommodationRepository.findVisibleAccommodations();
    
        if ((matchCareer == null || Boolean.FALSE.equals(matchCareer)) && 
        (matchSmoking == null || Boolean.FALSE.equals(matchSmoking)) && 
        (matchHobbies == null || Boolean.FALSE.equals(matchHobbies))) {
        return visibleAccommodations;
        }
    
    
        return visibleAccommodations.stream()
            .map(accommodation -> {
                List<Student> students = getStudentsInAccommodationForDateRange(accommodation, startDate, endDate);
    
                int score = 0; 
    
                if (Boolean.TRUE.equals(matchCareer) && students.stream()
                    .anyMatch(s -> s.getAcademicCareer().equals(currentStudent.getAcademicCareer()))) {
                    score++;
                }
    
                 if (Boolean.TRUE.equals(matchSmoking) && students.stream()
                    .anyMatch(s -> s.getIsSmoker().equals(currentStudent.getIsSmoker()))) {
                    score++;
                }
    
                if (Boolean.TRUE.equals(matchHobbies) && students.stream()
                    .anyMatch(s -> tieneHobbyEnComun(s, currentStudent))) {
                    score++;
                }
    
                return new AccommodationScore(accommodation, score);
            })
            .filter(a -> a.getScore() > 0) 
            .sorted((a1, a2) -> Integer.compare(a2.getScore(), a1.getScore())) 
            .map(AccommodationScore::getAccommodation) 
            .collect(Collectors.toList());
    }
    
    private boolean tieneHobbyEnComun(Student s, Student currentStudent) {
        List<String> hobbiesUser = Arrays.asList(currentStudent.getHobbies().split(","));
        List<String> hobbiesStudent = Arrays.asList(s.getHobbies().split(","));
        return hobbiesUser.stream().anyMatch(hobbiesStudent::contains);
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsInAccommodationForDateRange(Accommodation accommodation, LocalDate startDate, LocalDate endDate) {
        return accommodationRepository.findStudentsInAccommodationForDateRange(accommodation.getId(), startDate, endDate);
    }
    
    @Transactional
    public Accommodation update(Integer id, Accommodation accommodation){
        Accommodation newAccommodation = accommodationRepository.findById(id).orElseThrow(() -> new RuntimeException("No se ha encontrado ningún apartamento con esa Id"));

        BeanUtils.copyProperties(accommodation, newAccommodation, "id", "comments", "advertisement", "owner");
 
        return accommodationRepository.save(newAccommodation);

    }

	@Transactional
	public void delete(Integer id) {
		Accommodation accommodation = accommodationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado"));

        bookingRepository.deleteByAccommodation(accommodation);
        commentRepository.deleteByAccommodation(accommodation);

        accommodationRepository.delete(accommodation);
	}

    @Transactional
    public Accommodation save(Accommodation accommodation) throws DataAccessException {
        return accommodationRepository.save(accommodation);
    }
    
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

    @Transactional
    public List<Accommodation> getAccommodationsByOwner(Integer id) {
        return accommodationRepository.getAccommodationsByOwner(id);
    }
    
}