package com.eventbride.model;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.user.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.JOINED) // Usa herencia JOINED para separar tablas
public abstract class Person extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user; // Relación con User

    @Column(name = "first_name", nullable = false)
    @NotBlank 
    @Size(min = 1, max = 16)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotBlank 
    @Size(min = 1, max = 16)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    @NotBlank
    @Email
    private String email;

    @Column(name = "telephone", nullable = false, length = 15)
    @NotBlank
    private String telephone;

    @Column(name = "date_of_birth", nullable = false)
    @DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "photo", nullable = false)
    private String photo;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified;

    public enum Gender {
        WOMAN,MAN,OTHER
    }
}

