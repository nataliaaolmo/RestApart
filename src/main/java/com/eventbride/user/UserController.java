package com.eventbride.user;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.eventbride.dto.UserDTO;
import com.eventbride.dto.UserDTO2;
import com.eventbride.student.Student;

import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;


    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        UserDTO userDTO = new UserDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/{id}/without-account")
    public ResponseEntity<UserDTO2> getUserByIdWithoutAccount(@PathVariable Integer id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        UserDTO2 userDTO2 = new UserDTO2(user);
        return ResponseEntity.ok(userDTO2);
    }

    @GetMapping("/{id}/get-student")
    public ResponseEntity<Student> getStudentUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Student student = user.getStudent();
        return ResponseEntity.ok(student);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<User> user = Optional.ofNullable(userService.getUserByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfExists(
        @RequestParam String field,
        @RequestParam String value
    ) {
        boolean exists;
        switch (field) {
            case "username": exists = userRepository.existsByUsername(value); break;
            case "email": exists = userRepository.existsByEmail(value); break;
            case "telephone": exists = userRepository.existsByTelephone(value); break;
            default: return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<String> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Archivo vacío");
        }

        try {
            String username = userDetails.getUsername();
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }

            User user = optionalUser.get();

            String oldFilename = user.getPhoto(); 
            if (oldFilename != null && !oldFilename.equals("default.png")) {
                Path oldFilePath = Paths.get("uploads/images", oldFilename);
                Files.deleteIfExists(oldFilePath);
            }

            String newFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path newFilePath = Paths.get("uploads/images", newFilename);
            Files.copy(file.getInputStream(), newFilePath, StandardCopyOption.REPLACE_EXISTING);

            user.setPhoto(newFilename); 
            userRepository.save(user);

            return ResponseEntity.ok(newFilename);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error subiendo la foto");
        }
    }

    @PatchMapping("/{id}/verify-phone")
    public ResponseEntity<Void> verifyPhone(@PathVariable Integer id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setIsVerified(true);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody UserDTO updatedUser) {
		try {
			Optional<User> existingUser = userService.getUserById(id);
			if (existingUser.isEmpty()) {
				return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
			}
			updatedUser.setId(id);
			User savedUser = userService.updateUser(id, updatedUser);
			return new ResponseEntity<>(new UserDTO(savedUser), HttpStatus.OK);
		} catch (RuntimeException e) {
            e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}
}
