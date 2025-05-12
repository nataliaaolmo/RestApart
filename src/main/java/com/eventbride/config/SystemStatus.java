package com.eventbride.config; 

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class SystemStatus {

    @Id
    private Long id = 1L;

    private boolean locked = false;

    public SystemStatus() {}

    public SystemStatus(boolean locked) {
        this.locked = locked;
    }

    public Long getId() {
        return id;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }
}
