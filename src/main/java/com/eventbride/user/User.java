package com.eventbride.user;

import com.eventbride.owner.Owner;
import com.eventbride.model.Person;
import com.eventbride.model.Person.Gender;
import com.eventbride.student.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    @Column(unique = true)
    private String username;

    private String password;

    @Column(name = "role", nullable = false)
    private String role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Person person;    

    public void setPerson(Person person) {
        this.person = person;
        person.setUser(this); 
    }

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

    public LocalDate getDateOfBirth() {
        return person != null ? person.getDateOfBirth() : null;
    }

    public Gender getGender() {
        return person != null ? person.getGender() : null;
    }

    public String getDescription() {
        return person != null ? person.getDescription() : null;
    }

public Integer getExperienceYears() {
    return "OWNER".equals(this.role) && person instanceof Owner ? ((Owner) person).getExperienceYears() : null;
}

public Boolean getIsSmoker() {
    return "STUDENT".equals(this.role) && person instanceof Student ? ((Student) person).getIsSmoker() : null;
}

public String getAcademicCareer() {
    return "STUDENT".equals(this.role) && person instanceof Student ? ((Student) person).getAcademicCareer() : null;
}

public String getHobbies() {
    return "STUDENT".equals(this.role) && person instanceof Student ? ((Student) person).getHobbies() : null;
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

