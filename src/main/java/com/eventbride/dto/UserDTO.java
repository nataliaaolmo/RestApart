package com.eventbride.dto;

import java.time.LocalDate;

import com.eventbride.model.Person.Gender;
import com.eventbride.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    Integer id;
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;

    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(max = 20, message = "El nombre de usuario no puede tener más de 20 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @Email(message = "Debe proporcionar un correo electrónico válido")
    @NotBlank(message = "El correo electrónico es obligatorio")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telephone;

    private String profilePicture;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "OWNER|STUDENT|ADMIN", message = "El rol debe ser OWNER, STUDENT o ADMIN")
    private String role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private Gender gender;

    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
    private String description;

    @Positive(message = "Los años de experiencia deben ser un número positivo")
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
