package com.Tshirt.Hukmillane_website_Backend.entity;


import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Data
@Entity
@Table(name = "tshirt_orders")
public class TShirtEntity {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;
    private String name;
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

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;


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
