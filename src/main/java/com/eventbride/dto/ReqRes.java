package com.eventbride.dto;

import java.time.LocalDate;
import java.util.List;

import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

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

    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String telephone;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String description;
    private String profilePicture;
    private String role;

    private UserDTO user;
    private List<User> usersList;

    // ✅ New constructor for status code and message
    public ReqRes(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
