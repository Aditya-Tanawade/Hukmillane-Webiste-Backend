package com.Tshirt.Hukmillane_website_Backend.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private Integer paymentSuccessCount;
    private Integer pendingDeliveryCount;
    private Integer deliveredCount;
    private Integer revenue;
}
