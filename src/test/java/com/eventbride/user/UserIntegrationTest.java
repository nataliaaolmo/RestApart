package com.eventbride.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import org.hamcrest.Matchers;

import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.dto.ReqRes;
import com.eventbride.dto.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eventbride.model.Person;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTUtils jwtUtil;

    @Test
    void shouldRegisterUser() throws Exception {
        ReqRes req = new ReqRes();
        req.setUsername("newuser123");
        req.setPassword("securepass");
        req.setEmail("newuser@example.com");
        req.setTelephone("111222333");
        req.setRole("STUDENT");
        req.setFirstName("New");
        req.setLastName("User");
        req.setGender(Person.Gender.MAN);
        req.setDateOfBirth(LocalDate.of(2000, 1, 1));
    
        mockMvc.perform(post("/api/users/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("newuser123"));
    }    

    @Test
    void shouldLoginUser() throws Exception {
        ReqRes req = new ReqRes();
        req.setUsername("charlie789");
        req.setPassword("1234"); 

        mockMvc.perform(post("/api/users/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void shouldReturnCurrentUserInfo() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        mockMvc.perform(get("/api/users/auth/current-user")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("charlie789"));
    }

    @Test
    void shouldUpdateUserInfo() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByUsername("charlie789").orElseThrow();

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName("Updated");
        dto.setLastName("Name");
        dto.setEmail("updated@example.com");
        dto.setTelephone("123123123");
        dto.setUsername("charlie789");  
        dto.setGender(Person.Gender.MAN);
        dto.setPassword("securepass123");
        dto.setRole("STUDENT");           
        dto.setDateOfBirth(LocalDate.of(2001, 5, 19)); 

        mockMvc.perform(put("/api/users/" + user.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"));
    }

    @Test
    void shouldUploadProfilePhoto() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "fake-image-content".getBytes()
        );

        mockMvc.perform(multipart("/api/users/upload-photo")
                .file(file)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString(".png")));
    }
}

