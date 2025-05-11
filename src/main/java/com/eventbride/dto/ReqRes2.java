package com.eventbride.dto;

import java.time.LocalDate;
import java.util.List;


import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReqRes2 {

    private int statusCode;
    private String error;
    private String token;
    private String refreshToken;
    private String expirationTime;
    private String message;

    private String lastName;

    private String firstName;

    @Email(message = "Debe proporcionar un correo electrónico válido")
    private String email;

    private String telephone;

    private String profilePicture;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private Gender gender;

    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
    private String description;

    private Boolean isSmoker;
    private String academicCareer;
    private String hobbies;
    private Boolean isVerified;

    private UserDTO2 user;
    private List<User> usersList;

    public ReqRes2(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
