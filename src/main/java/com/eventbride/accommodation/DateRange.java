package com.eventbride.accommodation;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDate;

@Embeddable
public class DateRange {
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    public boolean isInRange(LocalDate value) {
        return (value.isAfter(startDate) || value.isEqual(startDate)) &&
               (value.isBefore(endDate) || value.isEqual(endDate));
    }
}
