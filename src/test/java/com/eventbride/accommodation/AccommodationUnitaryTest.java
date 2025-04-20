package com.eventbride.accommodation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import com.eventbride.advertisement.Advertisement;
import com.eventbride.booking.BookingRepository;
import com.eventbride.comment.CommentRepository;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;

public class AccommodationUnitaryTest {

    @Mock
    private AccommodationRepository accommodationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private AccommodationService accommodationService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll_shouldReturnAllAccommodations() {
        Accommodation acc1 = new Accommodation();
        acc1.setId(1);
        Accommodation acc2 = new Accommodation();
        acc2.setId(2);

        List<Accommodation> mockList = List.of(acc1, acc2);
        when(accommodationRepository.findAll()).thenReturn(mockList);

        List<Accommodation> result = accommodationService.findAll();

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getId());
        assertEquals(2, result.get(1).getId());
        verify(accommodationRepository).findAll();
    }

    @Test
    void testGetFilteredAccommodations_withWifiAndRadius_shouldReturnFiltered() {
        Accommodation a1 = new Accommodation();
        a1.setId(1);
        a1.setWifi(true);
        a1.setIsEasyParking(true);
        a1.setLatitud(37.3772); 
        a1.setLongitud(-5.9869);

        Accommodation a2 = new Accommodation();
        a2.setId(2);
        a2.setWifi(false);
        a2.setIsEasyParking(true);
        a2.setLatitud(40.4168); 
        a2.setLongitud(-3.7038);

        List<Accommodation> mockList = Arrays.asList(a1, a2);
        when(accommodationRepository.findFilteredAccommodationsBase(
            any(), any(), any(), any())).thenReturn(mockList);


        List<Accommodation> result = accommodationService.getFilteredAccommodations(
            500.0, null, null, 1, 37.3772, -5.9869, 10.0, true, true);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());
    }

    @Test
    void testGetFilteredAccommodations_noMatch_shouldReturnEmptyList() {
        Accommodation a1 = new Accommodation();
        a1.setId(1);
        a1.setWifi(false); 
        a1.setIsEasyParking(true);
        a1.setLatitud(41.3851); 
        a1.setLongitud(2.1734);

        Accommodation a2 = new Accommodation();
        a2.setId(2);
        a2.setWifi(false); 
        a2.setIsEasyParking(false);
        a2.setLatitud(40.4168); 
        a2.setLongitud(-3.7038);

        List<Accommodation> mockList = Arrays.asList(a1, a2);
        when(accommodationRepository.findFilteredAccommodationsBase(any(), any(), any(), any()))
            .thenReturn(mockList);

        List<Accommodation> result = accommodationService.getFilteredAccommodations(
            500.0, null, null, 1, 37.3772, -5.9869, 10.0, true, true); // Coordenadas: Sevilla, radio pequeño

        assertTrue(result.isEmpty(), "La lista debería estar vacía porque ningún alojamiento cumple los filtros");
    }

    @Test
    void testFindAccommodationsByAffinity_matchCareerAndHobbies_shouldReturnOrdered() {
        Student currentStudent = new Student();
        currentStudent.setId(1);
        currentStudent.setAcademicCareer("Informática");
        currentStudent.setIsSmoker(false);
        currentStudent.setHobbies("futbol,cocina");

        Accommodation acc1 = new Accommodation();
        acc1.setId(100);

        Student studentInAcc1 = new Student();
        studentInAcc1.setAcademicCareer("Informática");
        studentInAcc1.setIsSmoker(true);
        studentInAcc1.setHobbies("cocina,leer");

        LocalDate start = LocalDate.of(2025, 5, 1);
        LocalDate end = LocalDate.of(2025, 6, 1);

        when(studentRepository.findById(1)).thenReturn(Optional.of(currentStudent));
        when(accommodationRepository.findVisibleAccommodations()).thenReturn(List.of(acc1));
        when(accommodationRepository.findStudentsInAccommodationForDateRange(eq(100), eq(start), eq(end)))
            .thenReturn(List.of(studentInAcc1));

        List<Accommodation> result = accommodationService.findAccommodationsByAffinity(
            1, true, false, true, start, end
        );

        assertEquals(1, result.size(), "Debe devolverse un alojamiento");
        assertEquals(100, result.get(0).getId());
    }

    @Test
    void testFindAccommodationsByAffinity_noMatch_shouldReturnEmptyList() {
        Student currentStudent = new Student();
        currentStudent.setId(1);
        currentStudent.setAcademicCareer("Informática");
        currentStudent.setIsSmoker(false);
        currentStudent.setHobbies("videojuegos,leer");
    
        Accommodation acc1 = new Accommodation();
        acc1.setId(200);
    
        Student studentInAcc1 = new Student();
        studentInAcc1.setAcademicCareer("Medicina");
        studentInAcc1.setIsSmoker(true);
        studentInAcc1.setHobbies("baloncesto,cocina");
    
        LocalDate start = LocalDate.of(2025, 5, 1);
        LocalDate end = LocalDate.of(2025, 6, 1);
    
        when(studentRepository.findById(1)).thenReturn(Optional.of(currentStudent));
        when(accommodationRepository.findVisibleAccommodations()).thenReturn(List.of(acc1));
        when(accommodationRepository.findStudentsInAccommodationForDateRange(eq(200), eq(start), eq(end)))
            .thenReturn(List.of(studentInAcc1));
    
        List<Accommodation> result = accommodationService.findAccommodationsByAffinity(
            1, true, true, true, start, end
        );
    
        assertTrue(result.isEmpty(), "No debería devolverse ningún alojamiento porque no hay afinidades");
    }

    @Test
    void testUpdate_existingAccommodation_shouldUpdateFieldsAndSave() {
        Advertisement ad = new Advertisement();
        ad.setTitle("Antiguo título");

        Accommodation existing = new Accommodation();
        existing.setId(1);
        existing.setAdvertisement(ad);
        existing.setPricePerMonth(300.0);

        Accommodation updated = new Accommodation();
        updated.setPricePerMonth(350.0);

        when(accommodationRepository.findById(1)).thenReturn(Optional.of(existing));
        when(accommodationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Accommodation result = accommodationService.update(1, updated);

        assertEquals("Antiguo título", result.getAdvertisement().getTitle());
        assertEquals(350.0, result.getPricePerMonth());
        assertEquals(1, result.getId()); 
        verify(accommodationRepository).save(existing);
    }

    @Test
    void testUpdate_nonExistingAccommodation_shouldThrowException() {
        Advertisement ad = new Advertisement();
        ad.setTitle("Cualquier título");

        Accommodation updated = new Accommodation();
        updated.setAdvertisement(ad);

        when(accommodationRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            accommodationService.update(999, updated)
        );

        assertEquals("No se ha encontrado ningún apartamento con esa Id", ex.getMessage());
        verify(accommodationRepository, never()).save(any());
    }

    @Test
    void testDelete_existingAccommodation_shouldDeleteBookingsCommentsAndAccommodation() {
        Accommodation accommodation = new Accommodation();
        accommodation.setId(1);
    
        when(accommodationRepository.findById(1)).thenReturn(Optional.of(accommodation));
    
        accommodationService.delete(1);
    
        verify(bookingRepository).deleteByAccommodation(accommodation);
        verify(commentRepository).deleteByAccommodation(accommodation);
        verify(accommodationRepository).delete(accommodation);
    }

    @Test
    void testDelete_nonExistingAccommodation_shouldThrowException() {
        when(accommodationRepository.findById(999)).thenReturn(Optional.empty());
    
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            accommodationService.delete(999)
        );
    
        assertEquals("Alojamiento no encontrado", ex.getMessage());
    
        verify(bookingRepository, never()).deleteByAccommodation(any());
        verify(commentRepository, never()).deleteByAccommodation(any());
        verify(accommodationRepository, never()).delete(any());
    }

    @Test
    void testSave_validAccommodation_shouldCallRepositorySave() {
        Advertisement ad = new Advertisement();
        ad.setTitle("Nuevo piso en Reina Mercedes");

        Accommodation accommodation = new Accommodation();
        accommodation.setAdvertisement(ad);
        accommodation.setPricePerMonth(400.0);

        when(accommodationRepository.save(accommodation)).thenReturn(accommodation);

        Accommodation result = accommodationService.save(accommodation);

        assertNotNull(result);
        assertEquals("Nuevo piso en Reina Mercedes", result.getAdvertisement().getTitle());
        assertEquals(400.0, result.getPricePerMonth());
        verify(accommodationRepository).save(accommodation);
    }

    @Test
    void testSave_repositoryThrowsException_shouldPropagate() {
        Advertisement ad = new Advertisement();
        ad.setTitle("Piso erróneo");

        Accommodation accommodation = new Accommodation();
        accommodation.setAdvertisement(ad);

        when(accommodationRepository.save(accommodation))
            .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        assertThrows(DataIntegrityViolationException.class, () ->
            accommodationService.save(accommodation)
        );

        verify(accommodationRepository).save(accommodation);
    }

    @Test
    void testGetAccommodationsByOwner_existingOwner_shouldReturnList() {
        Accommodation acc1 = new Accommodation();
        acc1.setId(1);
        Accommodation acc2 = new Accommodation();
        acc2.setId(2);

        when(accommodationRepository.getAccommodationsByOwner(99)).thenReturn(List.of(acc1, acc2));

        List<Accommodation> result = accommodationService.getAccommodationsByOwner(99);

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getId());
        assertEquals(2, result.get(1).getId());
        verify(accommodationRepository).getAccommodationsByOwner(99);
    }

    @Test
    void testGetAccommodationsByOwner_noAccommodations_shouldReturnEmptyList() {
        when(accommodationRepository.getAccommodationsByOwner(123)).thenReturn(List.of());

        List<Accommodation> result = accommodationService.getAccommodationsByOwner(123);

        assertTrue(result.isEmpty());
        verify(accommodationRepository).getAccommodationsByOwner(123);
    }
}

