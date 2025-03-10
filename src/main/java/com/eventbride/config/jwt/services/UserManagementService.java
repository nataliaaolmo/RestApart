package com.eventbride.config.jwt.services;

import java.util.HashMap;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.dto.ReqRes;
import com.eventbride.dto.UserDTO;
import com.eventbride.model.Owner;
import com.eventbride.model.Person;
import com.eventbride.model.Student;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import jakarta.validation.ConstraintViolationException;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ReqRes register(ReqRes registrationRequest) {
        ReqRes resp = new ReqRes();
        try {
            User user = new User();
            user.setUsername(registrationRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setRole(registrationRequest.getRole());
    
            Person person;
            if ("OWNER".equalsIgnoreCase(registrationRequest.getRole())) {
                Owner owner = new Owner();
                owner.setFirstName(registrationRequest.getFirstName());
                owner.setLastName(registrationRequest.getLastName());
                owner.setEmail(registrationRequest.getEmail());
                owner.setTelephone(registrationRequest.getTelephone());
                owner.setDateOfBirth(registrationRequest.getDateOfBirth());
                owner.setGender(registrationRequest.getGender());
                owner.setDescription(registrationRequest.getDescription());
                owner.setPhoto(registrationRequest.getProfilePicture());
                owner.setIsVerified(false);
                owner.setExperienceYears(registrationRequest.getExperienceYears());
                person = owner;
            } else if ("STUDENT".equalsIgnoreCase(registrationRequest.getRole())) {
                Student student = new Student();
                student.setFirstName(registrationRequest.getFirstName());
                student.setLastName(registrationRequest.getLastName());
                student.setEmail(registrationRequest.getEmail());
                student.setTelephone(registrationRequest.getTelephone());
                student.setDateOfBirth(registrationRequest.getDateOfBirth());
                student.setGender(registrationRequest.getGender());
                student.setDescription(registrationRequest.getDescription());
                student.setPhoto(registrationRequest.getProfilePicture());
                student.setIsVerified(false);
                student.setAcademicCareer(registrationRequest.getAcademicCareer());
                student.setHobbies(registrationRequest.getHobbies());
                student.setIsSmoker(registrationRequest.getIsSmoker());
                person = student;
            } else {
                throw new IllegalArgumentException("Rol inválido");
            }

            user.setPerson(person);
            person.setUser(user);
    
            user = userRepo.save(user);
    
            resp.setUser(new UserDTO(user));
            resp.setMessage("Usuario registrado exitosamente");
            resp.setStatusCode(200);
    
        } catch (DataIntegrityViolationException e) {
            resp.setStatusCode(400);
            resp.setError("El usuario con este nombre de usuario o correo electrónico ya existe.");
        } catch (ConstraintViolationException e) {
            resp.setStatusCode(400);
            resp.setError("Faltan campos obligatorios o son inválidos.");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError("Ocurrió un error inesperado: " + e.getMessage());
        }
        return resp;
    }
    
    public ReqRes getMyInfo(String username) {
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> userOptional = userRepo.findByUsername(username);
            if (userOptional.isPresent()) {
                reqRes.setUser(new UserDTO(userOptional.get()));
                reqRes.setStatusCode(200);
                reqRes.setMessage("successful");
            } else {
                reqRes.setStatusCode(404);
                reqRes.setMessage("Usuario no encontrado");
            }
        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setMessage("Error al obtener usuario: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes login(ReqRes loginRequest) {
    ReqRes response = new ReqRes();
    try {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        var user = userRepo.findByUsername(loginRequest.getUsername()).orElseThrow();
        var jwt = jwtUtils.generateToken(user);
        var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

        response.setStatusCode(200);
        response.setToken(jwt);
        response.setRole(user.getRole());
        response.setRefreshToken(refreshToken);
        response.setExpirationTime("24Hrs");
        response.setMessage("Inicio de sesión exitoso");

    } catch (Exception e) {
        response.setStatusCode(500);
        response.setMessage("Error en inicio de sesión: " + e.getMessage());
    }
    return response;
}

public ReqRes refreshToken(ReqRes refreshTokenRequest) {
    ReqRes response = new ReqRes();
    try {
        String username = jwtUtils.extractUsername(refreshTokenRequest.getToken());
        User user = userRepo.findByUsername(username).orElseThrow();

        if (jwtUtils.isTokenValid(refreshTokenRequest.getToken(), user)) {
            var jwt = jwtUtils.generateToken(user);
            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRefreshToken(refreshTokenRequest.getToken());
            response.setExpirationTime("24Hrs");
            response.setMessage("Token actualizado exitosamente");
        } else {
            response.setStatusCode(401);
            response.setMessage("Refresh token inválido o expirado.");
        }
    } catch (Exception e) {
        response.setStatusCode(500);
        response.setMessage("Error al refrescar token: " + e.getMessage());
    }
    return response;
}

    
}
