package com.Tshirt.Hukmillane_website_Backend.Service.impl;

import com.Tshirt.Hukmillane_website_Backend.DTO.ApiResponse;
import com.Tshirt.Hukmillane_website_Backend.DTO.DashboardResponse;
import com.Tshirt.Hukmillane_website_Backend.Repository.IdCardBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Repository.TshirtBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Service.AdminService;
import com.Tshirt.Hukmillane_website_Backend.Service.ExportService;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger =
            LoggerFactory.getLogger(AdminServiceImpl.class);

    @Autowired
    private IdCardBookingRepo idCardBookingRepo;

    @Autowired
    private TshirtBookingRepo tshirtBookingRepo;

    @Autowired
    private ExportService exportService;

    @Override
    public DashboardResponse getTShirtDashboard() {
        DashboardResponse dashboardResponse=new DashboardResponse();
        dashboardResponse.setPaymentSuccessCount(tshirtBookingRepo.getPaymentSuccessTshirtCount());
        dashboardResponse.setPendingDeliveryCount(tshirtBookingRepo.getTshirtPendingDeliveryCount());
        dashboardResponse.setDeliveredCount(tshirtBookingRepo.getTshirtDeliveredCount());
        dashboardResponse.setRevenue(tshirtBookingRepo.getTshirtRevenue());
        logger.info("Fetching TSHIRT Dashbaord {}",dashboardResponse);
        return dashboardResponse;
    }

    @Override
    public DashboardResponse getIdCardDashboard() {
        DashboardResponse dashboardResponse=new DashboardResponse();
        dashboardResponse.setPaymentSuccessCount(idCardBookingRepo.getPaymentSuccessIdCardCount());
        dashboardResponse.setPendingDeliveryCount(idCardBookingRepo.getIdCardPendingDeliveryCount());
        dashboardResponse.setDeliveredCount(idCardBookingRepo.getIdCardDeliveredCount());
        dashboardResponse.setRevenue(idCardBookingRepo.getIdCardRevenue());
        logger.info("Fetching IDCARD Dashbaord {}",dashboardResponse);
        return dashboardResponse;
    }


    @Override
    public List<TShirtEntity> getAllPaymentSucessTshirtOrders() {
        logger.info("Fetching All  TSHIRT orders {}",tshirtBookingRepo.findByOrderStatus("PAYMENT_SUCCESS"));
        return tshirtBookingRepo.findByOrderStatus("PAYMENT_SUCCESS");
    }


    @Override
    public ApiResponse<TShirtEntity> updateTshirtDeliveryStatus(Integer bookingId) {
        TShirtEntity entity = tshirtBookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        entity.setDeliveryStatus(DeliveryStatus.DELIVERED);
        TShirtEntity updated = tshirtBookingRepo.save(entity);
        return new ApiResponse<>(true, "Delivery status updated successfully", updated);
    }


    @Override
    public List<IdCardEntity> getAllPaymentSucessIdCardOrders() {
        return idCardBookingRepo.findByOrderStatus("PAYMENT_SUCCESS");
    }

    @Override
    public ApiResponse<IdCardEntity> updateIdCardDeliveryStatus(Integer bookingId) {
        IdCardEntity entity = idCardBookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        entity.setDeliveryStatus(DeliveryStatus.DELIVERED);
        IdCardEntity updated = idCardBookingRepo.save(entity);
        return new ApiResponse<>(true, "Delivery status updated successfully", updated);
    }

    @Override
    public byte[] exportPendingTshirtOrdersToExcel() {
        return exportService.exportPendingTshirtOrdersToExcel();
    }

    @Override
    public byte[] exportPendingIdCardOrdersToExcel() {
        return exportService.exportPendingIdCardOrdersToExcel();

    }


}
