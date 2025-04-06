package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Integer id;
    private String lastName;
    private String firstName;
    private String username;
    private String password;
    private String email;
    private String telephone;
    private String profilePicture;
    private String role;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private Gender gender;
    private String description;
    private Integer experienceYears;
    private Boolean isSmoker;
    private String academicCareer; 
    private String hobbies;
    private Boolean isVerified;

    public UserDTO(User user) {
        this.id = user.getId();
        this.lastName = user.getLastName();
        this.firstName = user.getFirstName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.telephone = user.getTelephone();
        this.profilePicture = user.getPhoto();
        this.role = user.getRole();
        this.dateOfBirth = user.getDateOfBirth();
        this.gender = user.getGender();
        this.description = user.getDescription();
        this.password = user.getPassword();
        this.isVerified = user.getIsVerified();
    
        if (user.getOwner() != null) {
            this.experienceYears = user.getOwner().getExperienceYears();
        }
    
        if (user.getStudent() != null) {
            this.isSmoker = user.getStudent().getIsSmoker();
            this.academicCareer = user.getStudent().getAcademicCareer();
            this.hobbies = user.getStudent().getHobbies();
        }
    }

    public UserDTO() {
    }
    
}
