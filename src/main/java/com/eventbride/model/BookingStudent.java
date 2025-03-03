package com.eventbride.model;

import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "bookingStudent")
public class BookingStudent extends BaseEntity {

    @Column(name = "bookingDate", nullable = false)
    @NotNull
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate bookingDate;

    @Column(name = "price", nullable = false)
    @NotNull
    @Positive
    private Double price;

    @ManyToOne(optional = false)
    @JoinColumn(name = "studentId", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bookingId", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Booking booking;

}
