package com.Tshirt.Hukmillane_website_Backend.Service;

import com.Tshirt.Hukmillane_website_Backend.DTO.ApiResponse;
import com.Tshirt.Hukmillane_website_Backend.DTO.DashboardResponse;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminService {


    public DashboardResponse getTShirtDashboard();

    public DashboardResponse getIdCardDashboard();

    public List<TShirtEntity>getAllPaymentSucessTshirtOrders();

    public ApiResponse<TShirtEntity> updateTshirtDeliveryStatus(Integer bookingId);

    public List<IdCardEntity> getAllPaymentSucessIdCardOrders();

    public ApiResponse<IdCardEntity> updateIdCardDeliveryStatus(Integer bookingId);

    byte[] exportPendingTshirtOrdersToExcel();

    byte[] exportPendingIdCardOrdersToExcel();




}
