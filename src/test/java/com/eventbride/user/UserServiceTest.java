package com.eventbride.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.config.jwt.services.UserDetailsServiceImpl;
import com.eventbride.config.jwt.services.UserManagementService;
import com.eventbride.dto.ReqRes;
import com.eventbride.dto.UserDTO;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;

public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserService userService;

    @InjectMocks
    private UserManagementService userManagementService;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsServiceImpl;
    
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }    

    @Test
    void testLoadUserByUsername_existingUser_shouldReturnUserDetails() {
        User user = new User();
        user.setUsername("testuser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsServiceImpl.loadUserByUsername("testuser");

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void testLoadUserByUsername_nonExistingUser_shouldThrowException() {
        when(userRepository.findByUsername("notfound")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
            userDetailsServiceImpl.loadUserByUsername("notfound")
        );
    }

    @Test
    void testGetAllUsers_shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(new User(), new User()));

        List<User> result = userService.getAllUsers();

        assertEquals(2, result.size());
    }

    @Test
    void testGetUserById_existingId_shouldReturnUser() {
        User user = new User();
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserById(1);

        assertTrue(result.isPresent());
    }

    @Test
    void testGetUserById_nonExistingId_shouldReturnEmptyOptional() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());
    
        Optional<User> result = userService.getUserById(999);
    
        assertTrue(result.isEmpty());
    }

    @Test
    void testIsUsernameTaken_existingUsername_shouldReturnTrue() {
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertTrue(userService.isUsernameTaken("taken"));
    }

    @Test
    void testGetUserByUsername_existingUsername_shouldReturnUser() {
        User user = new User();
        user.setUsername("marta");

        when(userRepository.findByUsername("marta")).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserByUsername("marta");

        assertTrue(result.isPresent());
        assertEquals("marta", result.get().getUsername());
    }

    @Test
    void testGetUserByUsername_nonExisting_shouldReturnEmpty() {
        when(userRepository.findByUsername("notfound")).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserByUsername("notfound");

        assertTrue(result.isEmpty());
    }

    @Test
    void testUpdateUser_existingUser_shouldUpdateFields() {
        User user = new User();
        user.setId(1);
        user.setUsername("oldname");

        UserDTO dto = new UserDTO();
        dto.setUsername("newname");
        dto.setPassword("newpass");
        dto.setEmail("new@email.com");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateUser(1, dto);

        assertEquals("newname", result.getUsername());
        assertEquals("new@email.com", result.getEmail());
        verify(userRepository).save(user);
    }

    @Test
    void testUpdateUser_nonExisting_shouldThrowException() {
        UserDTO dto = new UserDTO();
        dto.setUsername("nuevo");

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.updateUser(999, dto)
        );

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void testDeleteUser_shouldCallRepositoryDelete() {
        userService.deleteUser(123);

        verify(userRepository).deleteById(123);
    }

    @Test
    void testRegister_validStudent_shouldReturnSuccessResponse() {
        ReqRes req = new ReqRes();
        req.setUsername("marta");
        req.setPassword("1234");
        req.setRole("STUDENT");

        User savedUser = new User();
        savedUser.setUsername("marta");

        when(passwordEncoder.encode("1234")).thenReturn("encoded1234");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(studentRepository.save(any(Student.class))).thenReturn(new Student());

        ReqRes result = userManagementService.register(req);

        assertEquals(200, result.getStatusCode());
        assertEquals("Usuario registrado exitosamente", result.getMessage());
        assertNotNull(result.getUser());
    }

    @Test
    void testRegister_duplicateUser_shouldReturn400() {
        ReqRes req = new ReqRes();
        req.setUsername("repetido");
        req.setPassword("1234");

        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenThrow(new DataIntegrityViolationException("duplicado"));

        ReqRes result = userManagementService.register(req);

        assertEquals(400, result.getStatusCode());
        assertTrue(result.getError().contains("ya existe"));
    
    }

    @Test
    void testGetMyInfo_existingUser_shouldReturnUserDTO() {
        User user = new User();
        user.setUsername("laura");
    
        when(userRepository.findByUsername("laura")).thenReturn(Optional.of(user));
    
        ReqRes result = userManagementService.getMyInfo("laura");
    
        assertEquals(200, result.getStatusCode());
        assertEquals("successful", result.getMessage());
        assertNotNull(result.getUser());
    }

    @Test
    void testGetMyInfo_nonExistingUser_shouldReturn404() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        ReqRes result = userManagementService.getMyInfo("ghost");

        assertEquals(404, result.getStatusCode());
        assertEquals("Usuario no encontrado", result.getMessage());
    }

    @Test
    void testLogin_validCredentials_shouldReturnToken() {
        ReqRes login = new ReqRes();
        login.setUsername("validUser");
        login.setPassword("pass");

        User user = new User();
        user.setUsername("validUser");
        user.setRole("STUDENT");

        when(userRepository.findByUsername("validUser")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");
        when(jwtUtils.generateRefreshToken(any(), eq(user))).thenReturn("refresh-token");

        ReqRes result = userManagementService.login(login);

        assertEquals(200, result.getStatusCode());
        assertEquals("jwt-token", result.getToken());
        assertEquals("refresh-token", result.getRefreshToken());
        assertEquals("Inicio de sesión exitoso", result.getMessage());
    }

    @Test
    void testLogin_authenticationFails_shouldReturn500() {
        ReqRes login = new ReqRes();
        login.setUsername("fail");
        login.setPassword("wrong");

        doThrow(new RuntimeException("Bad credentials")).when(authenticationManager)
            .authenticate(any(UsernamePasswordAuthenticationToken.class));

        ReqRes result = userManagementService.login(login);

        assertEquals(500, result.getStatusCode());
        assertTrue(result.getMessage().contains("Error en inicio de sesión"));
    }

    @Test
    void testRefreshToken_valid_shouldReturnNewToken() {
        ReqRes req = new ReqRes();
        req.setToken("refresh-token");

        User user = new User();
        user.setUsername("user");

        when(jwtUtils.extractUsername("refresh-token")).thenReturn("user");
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(jwtUtils.isTokenValid("refresh-token", user)).thenReturn(true);
        when(jwtUtils.generateToken(user)).thenReturn("new-token");

        ReqRes result = userManagementService.refreshToken(req);

        assertEquals(200, result.getStatusCode());
        assertEquals("new-token", result.getToken());
        assertEquals("Token actualizado exitosamente", result.getMessage());
    }

    @Test
    void testRefreshToken_invalid_shouldReturn401() {
        ReqRes req = new ReqRes();
        req.setToken("invalid");

        User user = new User();
        user.setUsername("user");

        when(jwtUtils.extractUsername("invalid")).thenReturn("user");
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(jwtUtils.isTokenValid("invalid", user)).thenReturn(false);

        ReqRes result = userManagementService.refreshToken(req);

        assertEquals(401, result.getStatusCode());
        assertEquals("Refresh token inválido o expirado.", result.getMessage());
    }
}
