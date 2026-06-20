package com.Tshirt.Hukmillane_website_Backend.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Data
@Entity
@Table(name = "idCard-Orders")
public class IdCardEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;
    private String Name;
    private String email;
    private String phoneNumber;
    private Integer amount;
    @ElementCollection
    private List<SizeQuantity>sizeQuantities;
    private Integer totalQuantity;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String razorpayOrderId;
    private Integer razorpayAttempts;
    private String orderStatus;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String imageName;
    private String imageType;
    @Lob
    private byte[] imageData;


    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
    }
}
