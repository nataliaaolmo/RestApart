package com.eventbride.dto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReqRes {

    private int statusCode;
    private String error;
    private String token;
    private String refreshToken;
    private String expirationTime;
    private String message;

    @Size(max=20, message="El nombre de usuario no puede tener más de 20 caracteres")
    @NotBlank(message="El nombre de usuario es obligatorio")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")   
    private String password;

    @Size(max = 50, message = "El primer nombre no puede tener más de 50 caracteres")
    @NotBlank(message = "El primer nombre es obligatorio")
    private String firstName;

    @Size(max = 50, message = "El apellido no puede tener más de 50 caracteres")
    @NotBlank(message = "El apellido es obligatorio")    
    private String lastName;

    @Email(message = "Debe proporcionar un correo electrónico válido")
    @NotBlank(message = "El correo electrónico es obligatorio")    
    private String email;

    @Size(max = 15, message = "El número de teléfono no puede tener más de 15 caracteres")
    @NotBlank(message = "El teléfono es obligatorio")    
    private String telephone;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @NotNull    
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    @NotNull
    private Gender gender;

    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
    private String description;
    private String profilePicture;
    private String role;
    private Integer experienceYears;
    private Boolean isSmoker;
    private String academicCareer;
    private String hobbies;

    private UserDTO user;
    private List<User> usersList;

    public ReqRes(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
