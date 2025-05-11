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
import com.eventbride.dto.ReqRes2;
import com.eventbride.dto.UserDTO;
import com.eventbride.dto.UserDTO2;
import com.eventbride.owner.Owner;
import com.eventbride.owner.OwnerRepository;
import com.eventbride.student.Student;
import com.eventbride.student.StudentRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;

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

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    public ReqRes register(@Valid ReqRes registrationRequest) {
        ReqRes resp = new ReqRes();
        try {
            User user = new User();
            user.setUsername(registrationRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setRole(registrationRequest.getRole());
            
            user.setFirstName(registrationRequest.getFirstName());
            user.setLastName(registrationRequest.getLastName());
            user.setEmail(registrationRequest.getEmail());
            user.setTelephone(registrationRequest.getTelephone());
            user.setDateOfBirth(registrationRequest.getDateOfBirth());
            user.setGender(registrationRequest.getGender());
            user.setDescription(registrationRequest.getDescription());
            user.setPhoto(registrationRequest.getProfilePicture());
            user.setIsVerified(false);
    
            user = userRepo.save(user);
    
            if ("OWNER".equalsIgnoreCase(registrationRequest.getRole())) {
                Owner owner = new Owner();
                owner.setUser(user);
                owner.setExperienceYears(
                Optional.ofNullable(registrationRequest.getExperienceYears()).orElse(0)
                );
                owner = ownerRepository.save(owner);
                user.setOwner(owner);
            }
    
            else if ("STUDENT".equalsIgnoreCase(registrationRequest.getRole())) {
                Student student = new Student();
                student.setUser(user);
                student.setIsSmoker(registrationRequest.getIsSmoker());
                student.setAcademicCareer(registrationRequest.getAcademicCareer());
                student.setHobbies(registrationRequest.getHobbies());
                student = studentRepository.save(student);
                user.setStudent(student);
            }
    
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

    public ReqRes2 registerStudentWithoutAccount(@Valid ReqRes2 registrationRequest) {
        ReqRes2 resp = new ReqRes2();
        try {
            User user = new User();
            
            user.setFirstName(registrationRequest.getFirstName());
            user.setLastName(registrationRequest.getLastName());
            user.setEmail(registrationRequest.getEmail());
            user.setTelephone(registrationRequest.getTelephone());
            user.setDateOfBirth(registrationRequest.getDateOfBirth());
            user.setGender(registrationRequest.getGender());
            user.setDescription(registrationRequest.getDescription());
            user.setPhoto(registrationRequest.getProfilePicture());
            user.setIsVerified(false);
    
            user = userRepo.save(user);

                Student student = new Student();
                student.setUser(user);
                student.setIsSmoker(registrationRequest.getIsSmoker());
                student.setAcademicCareer(registrationRequest.getAcademicCareer());
                student.setHobbies(registrationRequest.getHobbies());
                student = studentRepository.save(student);
                user.setStudent(student);
    
                UserDTO2 dto = new UserDTO2(user);
                if (user.getStudent() != null) {
                    dto.setStudentId(user.getStudent().getId());
                }
                resp.setUser(dto);
                
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
