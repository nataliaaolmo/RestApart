package com.eventbride.student;

public class StudentProfileDTO {
    private String firstName;
    private String photo;

    public StudentProfileDTO(String firstName, String photo) {
        this.firstName = firstName;
        this.photo = photo;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getPhoto() {
        return photo;
    }
}
