package com.eventbride.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "advertisement")
public class Advertisement extends BaseEntity {

    @Column(name = "isVisible", nullable = false)
    private Boolean isVisible;

    @Column(name = "title", nullable = false)
    @NotBlank 
    private String title;

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST })
	@JoinColumn(name = "accommodationId", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Accommodation accommodation;

}
