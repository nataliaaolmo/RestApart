package com.eventbride.user;

import com.eventbride.model.Owner;
import com.eventbride.model.Person;
import com.eventbride.model.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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

    @Column(unique = true)
    private String username;

    private String password;

    @Column(name = "role", nullable = false)
    private String role;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Person person;

    public String getFirstName() {
        return person != null ? person.getFirstName() : null;
    }

    public String getLastName() {
        return person != null ? person.getLastName() : null;
    }

    public String getEmail() {
        return person != null ? person.getEmail() : null;
    }

    public String getTelephone() {
        return person != null ? person.getTelephone() : null;
    }

    public String getPhoto() {
        return person != null ? person.getPhoto() : null;
    }

    // Métodos para asignar Student o Owner correctamente
    public void setStudent(Student student) {
        this.person = student;
        student.setUser(this);
    }

    public void setOwner(Owner owner) {
        this.person = owner;
        owner.setUser(this);
    }

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

