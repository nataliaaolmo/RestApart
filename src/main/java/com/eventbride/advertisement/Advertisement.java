package com.eventbride.advertisement;
import com.eventbride.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity 
@Table(name = "advertisements")
public class Advertisement extends BaseEntity {

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible;

    @Column(name = "last_name", nullable = false, length = 50)
    @Size(max = 50, message = "El título no puede tener más de 50 caracteres")
    @NotBlank(message = "El título es obligatorio")
    private String title;

}
