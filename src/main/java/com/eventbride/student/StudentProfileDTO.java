package com.eventbride.student;

public class StudentProfileDTO {
    private Integer id;
    private String firstName;
    private String photo;
    private Integer userId;

    public StudentProfileDTO(String firstName, String photo, Integer id, Integer userId) {
        this.userId = userId;
        this.id = id;
        this.firstName = firstName;
        this.photo = photo;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getPhoto() {
        return photo;
    }

    public Integer getId() {
        return id;
    }

    public Integer getUserId() {
        return userId;
    }
}
