package com.eventbride.user;

import com.eventbride.owner.Owner;
import com.eventbride.model.Person.Gender;
import com.eventbride.student.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length =20)
    @Size(max=20, message="El nombre de usuario no puede tener más de 20 caracteres")
    @NotBlank(message="El nombre de usuario es obligatorio")
    private String username;

    @Column(nullable = false)
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).*$", 
             message = "La contraseña debe contener al menos una mayúscula y un carácter especial")
    private String password;

    @Column(name = "role", nullable = false)
    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "OWNER|STUDENT", message = "El rol debe ser OWNER o STUDENT")
    private String role;

    @Column(name = "first_name", nullable = false, length = 50)
    @Size(max = 50, message = "El primer nombre no puede tener más de 50 caracteres")
    @NotBlank(message = "El primer nombre es obligatorio")
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    @Size(max = 50, message = "El apellido no puede tener más de 50 caracteres")
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    @Email(message = "Debe proporcionar un correo electrónico válido")
    @NotBlank(message = "El correo electrónico es obligatorio")
    private String email;

    @Column(name = "telephone", nullable = false, length = 15)
    @Size(max = 15, message = "El número de teléfono no puede tener más de 15 caracteres")
    @NotBlank(message = "El teléfono es obligatorio")
    private String telephone;

    @Column(name = "date_of_birth")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "description", length = 255)
    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
    private String description;

    @Column(name = "photo")
    private String photo;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Student student;

    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Owner owner;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}

