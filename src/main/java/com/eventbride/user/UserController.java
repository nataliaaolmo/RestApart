package com.eventbride.user;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.eventbride.dto.UserDTO;

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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = {"http://localhost:5173",  "http://192.168.1.132:8081", "http://10.0.2.2:8081", "http://localhost:8081", "http://localhost:19006"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

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


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        logger.info("Intentando registrar usuario: {}", user.getUsername());

        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

@PostMapping("/upload-photo")
public ResponseEntity<String> uploadProfilePhoto(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails userDetails) {
    
    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body("Archivo vacío");
    }

    try {
        // 1. Buscar el usuario por username
        String username = userDetails.getUsername();
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        User user = optionalUser.get();

        // 2. Eliminar la foto anterior (si no es la default)
        String oldFilename = user.getPhoto(); // o getProfilePicture(), depende de tu modelo
        if (oldFilename != null && !oldFilename.equals("default.png")) {
            Path oldFilePath = Paths.get("src/main/resources/static/images", oldFilename);
            Files.deleteIfExists(oldFilePath);
        }

        // 3. Guardar nueva imagen
        String newFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path newFilePath = Paths.get("src/main/resources/static/images", newFilename);
        Files.copy(file.getInputStream(), newFilePath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Actualizar la foto del usuario
        user.setPhoto(newFilename); // o setProfilePicture()
        userRepository.save(user);

        return ResponseEntity.ok(newFilename);

    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error subiendo la foto");
    }
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
    }
}
