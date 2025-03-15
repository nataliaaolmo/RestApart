package com.eventbride.booking_student;

import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.format.annotation.DateTimeFormat;

import com.eventbride.booking.Booking;
import com.eventbride.model.BaseEntity;
import com.eventbride.student.Student;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "booking_students",
       uniqueConstraints = { @UniqueConstraint(columnNames = { "student_id", "booking_id" }) })
public class BookingStudent extends BaseEntity {

    @Column(name = "booking_date", nullable = false)
    @NotNull
	@DateTimeFormat(pattern = "yyyy/MM/dd")
    private LocalDate bookingDate;

    @Column(name = "price", nullable = false)
    @NotNull
    @Positive
    private Double price;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Booking booking;

}
