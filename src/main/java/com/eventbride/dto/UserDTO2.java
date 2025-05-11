package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO2 {

    Integer id;
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
    private Integer studentId;

    public UserDTO2(User user) {
        this.id = user.getId();
        this.lastName = user.getLastName();
        this.firstName = user.getFirstName();
        this.email = user.getEmail();
        this.telephone = user.getTelephone();
        this.profilePicture = user.getPhoto();
        this.dateOfBirth = user.getDateOfBirth();
        this.gender = user.getGender();
        this.description = user.getDescription();
        this.isVerified = user.getIsVerified();
    
        if (user.getStudent() != null) {
            this.isSmoker = user.getStudent().getIsSmoker();
            this.academicCareer = user.getStudent().getAcademicCareer();
            this.hobbies = user.getStudent().getHobbies();
            this.studentId = user.getStudent().getId();
        }
    }

}
