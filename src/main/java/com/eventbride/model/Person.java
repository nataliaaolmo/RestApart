package com.eventbride.model;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class Person extends BaseEntity {

    @Column(name = "first_name", nullable = false)
    @NotBlank 
	@Size(min = 1, max = 16)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotBlank 
	@Size(min = 1, max = 16)
    private String lastName;

    @Column(name = "username", nullable = false, unique = true)
    @NotBlank
	@Size(min = 1, max = 16)
    private String username;

	@Column(name = "email", nullable = false, unique = true)
    @NotBlank
	@Email
    private String email;

	@Column(name = "telephone", nullable = false)
    @NotNull 
	@Digits(integer = 9, fraction = 0)
    private Integer telephone;

    @Column(name = "password", nullable = false)
    @NotBlank
    private String password;

    @Column(name = "dateOfBirth", nullable = false)
    @NotBlank
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "photo", nullable = false)
    private String photo;

    @Column(name = "isVerified", nullable = false)
    private Boolean isVerified;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    private List<Comment> ratings;

}
