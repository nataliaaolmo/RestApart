package com.eventbride.booking;

import java.time.LocalDate;

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
import com.eventbride.accommodation.DateRange;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
public class BookingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JWTUtils jwtUtil;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Test
    void shouldReturnBookingsByUser() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername("charlie789")
        .password("1234") 
        .roles("STUDENT")
        .build();
        String token = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByUsername("charlie789").orElseThrow(); 
        Booking booking = new Booking();
        Student student = studentRepository.findByUserUsername(user.getUsername()).orElseThrow();
        booking.setStudent(student);
        booking.setAccommodation(accommodationRepository.findAll().get(2));
        booking.setBookingDate(LocalDate.now());
        booking.setStayRange(new DateRange(LocalDate.now().plusDays(1), LocalDate.now().plusDays(5)));
        booking.setPrice(200.0);
        booking.setIsVerified(false);
        bookingService.save(booking);

        mockMvc.perform(get("/api/bookings/" + student.getId())
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void shouldBookAccommodationAsStudent() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("charlie789")
            .password("1234") 
            .roles("STUDENT")
            .build();
        String token = jwtUtil.generateToken(userDetails);

        Accommodation acc = accommodationRepository.findAll().stream()
            .filter(a -> a.getStudents() > 1)
            .findFirst()
            .orElseThrow();

        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = start.plusDays(3);

        String body = """
        {
            "stayRange": {
                "startDate": "%s",
                "endDate": "%s"
            }
        }
        """.formatted(start, end);

        mockMvc.perform(post("/api/bookings/" + acc.getId())
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.price").exists())
            .andExpect(jsonPath("$.accommodation.id").value(acc.getId()));
    }
    
}
