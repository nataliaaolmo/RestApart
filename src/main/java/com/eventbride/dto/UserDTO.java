package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.model.Owner;
import com.eventbride.model.Person.Gender;
import com.eventbride.model.Student;
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
    this.password= user.getPassword();

    // Verifica el tipo de person antes de acceder a sus métodos específicos
    if ("OWNER".equals(user.getRole()) && user.getPerson() instanceof Owner) {
        this.experienceYears = ((Owner) user.getPerson()).getExperienceYears();
    } else {
        this.experienceYears = null;
    }

    if ("STUDENT".equals(user.getRole()) && user.getPerson() instanceof Student) {
        this.isSmoker = ((Student) user.getPerson()).getIsSmoker();
        this.academicCareer = ((Student) user.getPerson()).getAcademicCareer();
        this.hobbies = ((Student) user.getPerson()).getHobbies();
    } else {
        this.isSmoker = null;
        this.academicCareer = null;
        this.hobbies = null;
    }
}

}
