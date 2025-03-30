package com.eventbride.student;

public class StudentProfileDTO {
    private Integer id;
    private String firstName;
    private String photo;

    public StudentProfileDTO(String firstName, String photo, Integer id) {
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
}
