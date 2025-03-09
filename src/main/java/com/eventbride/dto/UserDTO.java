package com.eventbride.dto;

import com.eventbride.user.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Integer id;
    private String lastname;
    private String firstname;
    private String username;
    private String email;
    private String telephone;
    private String profilePicture;
    private String role;

    public UserDTO(User user) {
        this.id = user.getId();
        this.lastname = user.getLastName(); // Ahora accede a person a través de User
        this.firstname = user.getFirstName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.telephone = user.getTelephone();
        this.profilePicture = user.getPhoto();
        this.role = user.getRole();
    }
}
