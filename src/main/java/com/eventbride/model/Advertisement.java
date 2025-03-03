package com.eventbride.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "advertisements")
public class Advertisement extends BaseEntity {

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible;

    @Column(name = "title", nullable = false)
    @NotBlank 
    private String title;

}
