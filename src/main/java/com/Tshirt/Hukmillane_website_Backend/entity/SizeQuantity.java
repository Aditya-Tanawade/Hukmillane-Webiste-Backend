package com.Tshirt.Hukmillane_website_Backend.entity;


import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class SizeQuantity {
    private String size;
    private int quantity;
}
