package com.eventbride.comment;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.AccommodationRepository;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class CommentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JWTUtils jwtUtil;

    @Autowired
    private AccommodationRepository accommodationRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldReturnCommentsByAccommodation() throws Exception {
        Accommodation acc = accommodationRepository.findAll().get(0);
    
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);
    
        mockMvc.perform(get("/api/comments/accomodations/" + acc.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
    

    @Test
    void shouldReturnCommentsByUser() throws Exception {
        User user = userRepository.findByUsername("irene789").orElseThrow();
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        mockMvc.perform(get("/api/comments/users/" + user.getId())
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldPostCommentForAccommodation() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        Accommodation acc = accommodationRepository.findAll().get(0);

        String jsonBody = """
        {
            "text": "Muy buen sitio",
            "rating": 5
        }
        """;

        mockMvc.perform(post("/api/comments/accomodations/" + acc.getId())
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .content(jsonBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.text").value("Muy buen sitio"))
            .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    void shouldPostCommentForUser() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByUsername("bob456").orElseThrow();

        String jsonBody = """
        {
            "text": "Buen trato como propietario",
            "rating": 4
        }
        """;

        mockMvc.perform(post("/api/comments/users/" + user.getId())
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .content(jsonBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.text").value("Buen trato como propietario"))
            .andExpect(jsonPath("$.rating").value(4));
    }

    @Test
    void shouldReturnAverageRatingForAccommodation() throws Exception {
        Accommodation acc = accommodationRepository.findAll().get(0);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername("charlie789")
        .password("1234") 
        .roles("STUDENT")
        .build();
        String token = jwtUtil.generateToken(userDetails);

        mockMvc.perform(get("/api/comments/accomodations/" + acc.getId() + "/average")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isNumber());
    }
}
