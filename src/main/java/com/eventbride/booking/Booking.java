package com.eventbride.booking;

import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.accommodation.Accommodation;
import com.eventbride.accommodation.DateRange;
import com.eventbride.model.BaseEntity;
import com.eventbride.student.Student;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
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
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @Column(name = "booking_date", nullable = false)
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate bookingDate;

    @Column(name = "price", nullable = false)
    @Positive
    private Double price;

    @Embedded
    @NotNull
    private DateRange stayRange;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Student student;

    @ManyToOne
    @JoinColumn(name = "accommodation_id", nullable = false)
    private Accommodation accommodation;

}
