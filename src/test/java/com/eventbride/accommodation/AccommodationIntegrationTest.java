package com.eventbride.accommodation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.eventbride.advertisement.Advertisement;
import com.eventbride.advertisement.AdvertisementRepository;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.owner.Owner;
import com.eventbride.owner.OwnerRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class AccommodationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JWTUtils jwtUtil;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Test
    void shouldReturnAllAccommodations() throws Exception {
        mockMvc.perform(get("/api/accommodations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnStudentsInAccommodationBetweenDates() throws Exception {
        mockMvc.perform(get("/api/accommodations/1/students")
                .param("startDate", "2025-05-01")
                .param("endDate", "2025-06-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnFilteredAccommodationsWithAffinity() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        mockMvc.perform(get("/api/accommodations/search")
                .header("Authorization", "Bearer " + token)
                .param("maxPrice", "500")
                .param("startDate", "2023-01-01")
                .param("endDate", "2025-12-31")
                .param("students", "1")
                .param("wifi", "true")
                .param("isEasyParking", "false")
                .param("matchCareer", "true")
                .param("matchSmoking", "false")
                .param("matchHobbies", "true")
                .param("latitude", "37.38")
                .param("longitude", "-5.99")
                .param("radius", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldCreateAccommodationAsOwner() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername("alice123")
        .password("1234") 
        .roles("OWNER")
        .build();
        String token = jwtUtil.generateToken(userDetails);

        String alojamientoJson = """
            {
                "rooms": 2,
                "beds": 2,
                "pricePerDay": 20.0,
                "pricePerMonth": 400.0,
                "description": "Alojamiento nuevo en buena zona",
                "latitud": 37.390,
                "longitud": -5.990,
                "students": 2,
                "wifi": true,
                "isEasyParking": false,
                "availability": {
                    "startDate": "2024-06-01",
                    "endDate": "2025-06-01"
                },
                "images": []
            }
        """;

        mockMvc.perform(post("/api/accommodations")
                .header("Authorization", "Bearer " + token)
                .param("title", "Anuncio de prueba")
                .contentType("application/json")
                .content(alojamientoJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.advertisement.title").value("Anuncio de prueba"))
            .andExpect(jsonPath("$.owner.user.username").value("alice123"));
    }

    @Test
    void shouldUpdateAccommodationAsOwner() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername("alice123")
        .password("1234") 
        .roles("OWNER")
        .build();
        String token = jwtUtil.generateToken(userDetails);

        // Crear alojamiento
        Advertisement ad = new Advertisement();
        ad.setTitle("Alojamiento a actualizar");
        ad.setIsVisible(true);
        ad = advertisementRepository.save(ad);

        Owner owner = ownerRepository.findByUserUsername("alice123").orElseThrow();
        
        Accommodation acc = new Accommodation();
        acc.setRooms(2);
        acc.setBeds(2);
        acc.setPricePerDay(20.0);
        acc.setPricePerMonth(400.0);
        acc.setDescription("Original");
        acc.setLatitud(37.390);
        acc.setLongitud(-5.990);
        acc.setStudents(2);
        acc.setWifi(true);
        acc.setIsEasyParking(true);
        acc.setAvailability(new DateRange(LocalDate.now(), LocalDate.now().plusMonths(2)));
        acc.setOwner(owner);
        acc.setAdvertisement(ad);

        Accommodation saved = accommodationRepository.save(acc);

        // Cuerpo actualizado
        String updatedJson = """
        {
            "rooms": 4,
            "beds": 4,
            "pricePerDay": 50.0,
            "pricePerMonth": 1000.0,
            "description": "Modificado",
            "latitud": 37.390,
            "longitud": -5.990,
            "students": 4,
            "wifi": false,
            "isEasyParking": false,
            "availability": {
                "startDate": "%s",
                "endDate": "%s"
            },
            "images": []
        }
        """.formatted(LocalDate.now(), LocalDate.now().plusMonths(2));

        mockMvc.perform(put("/api/accommodations/" + saved.getId())
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .content(updatedJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rooms").value(4))
            .andExpect(jsonPath("$.description").value("Modificado"));
    }


    @Test
    void shouldDeleteAccommodationAsOwner() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername("alice123")
        .password("1234") 
        .roles("OWNER")
        .build();
        String token = jwtUtil.generateToken(userDetails);

        // Crear alojamiento como setup
        Accommodation acc = new Accommodation();
        acc.setRooms(1);
        acc.setBeds(1);
        acc.setPricePerDay(25.0);
        acc.setPricePerMonth(500.0);
        acc.setDescription("Temporal para eliminar");
        acc.setLatitud(37.380);
        acc.setLongitud(-5.995);
        acc.setStudents(1);
        acc.setWifi(true);
        acc.setIsEasyParking(false);
        acc.setAvailability(new DateRange(LocalDate.now(), LocalDate.now().plusMonths(6)));

        // Relacionar con propietario y anuncio
        Advertisement ad = new Advertisement();
        ad.setTitle("Eliminar anuncio");
        ad.setIsVisible(true);
        ad = advertisementRepository.save(ad);

        Owner owner = ownerRepository.findByUserUsername("alice123").orElseThrow();
        acc.setOwner(owner);
        acc.setAdvertisement(ad);
        Accommodation saved = accommodationRepository.save(acc);

        // Eliminar
        mockMvc.perform(delete("/api/accommodations/" + saved.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());

        // Verificar que ya no existe
        Assertions.assertFalse(accommodationRepository.findById(saved.getId()).isPresent());
    }
}
