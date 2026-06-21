package com.Tshirt.Hukmillane_website_Backend.DTO;

import com.Tshirt.Hukmillane_website_Backend.entity.SizeQuantity;
import jakarta.persistence.Lob;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReceiptDTO {
    private Integer bookingId;
    private String Name;
    private String email;
    private String phoneNumber;
    private Integer amount;
    private List<SizeQuantity> sizeQuantities;
    private Integer totalQuantity;
    private LocalDateTime updatedAt;
    private String razorpayOrderId;
    private String razorpayPaymentId;

    private String idCardHolderName;
    private Product product;




}
