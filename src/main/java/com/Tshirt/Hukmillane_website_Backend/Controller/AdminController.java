package com.Tshirt.Hukmillane_website_Backend.Controller;


import com.Tshirt.Hukmillane_website_Backend.DTO.ApiResponse;
import com.Tshirt.Hukmillane_website_Backend.DTO.DashboardResponse;
import com.Tshirt.Hukmillane_website_Backend.Service.AdminService;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/")
public class AdminController {

    @Autowired
    private AdminService adminService;


// ====================  DASHBOARD ====================


    @GetMapping("/tshirt/dashboard")
    public ResponseEntity<DashboardResponse> getTshirtDashboard() {
        return ResponseEntity.ok(adminService.getTShirtDashboard());
    }

    @GetMapping("/idcard/dashboard")
    public ResponseEntity<DashboardResponse> getIdCardDashboard() {
        return ResponseEntity.ok(adminService.getIdCardDashboard());
    }

    // ==================== TSHIRT ORDERS ====================

    @GetMapping("/tshirt/all-orders")
    public ResponseEntity<List<TShirtEntity>> getAllPaymentSucessTshirtOrders() {
        return ResponseEntity.ok(adminService.getAllPaymentSucessTshirtOrders());
    }

    @PutMapping("/tshirt/delivered/{bookingId}")
    public ResponseEntity<ApiResponse<TShirtEntity>> updateTshirtDeliveryStatus(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(adminService.updateTshirtDeliveryStatus(bookingId));
    }




    // ==================== ID CARD ORDERS ====================

    @GetMapping("/idcard/all-orders")
    public ResponseEntity<List<IdCardEntity>> getAllPaymentSucessIdCardOrders() {
        return ResponseEntity.ok(adminService.getAllPaymentSucessIdCardOrders());
    }

    @PutMapping("/idcard/delivered/{bookingId}")
    public ResponseEntity<ApiResponse<IdCardEntity>> updateIdCardDeliveryStatus(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(adminService.updateIdCardDeliveryStatus(bookingId));
    }


    @GetMapping("/tshirt/export/excel")
    public ResponseEntity<byte[]> exportPendingTshirtOrders() {

        byte[] excel = adminService.exportPendingTshirtOrdersToExcel();

        String fileName =
                "tshirt_orders_" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excel.length)
                .body(excel);
    }


    @GetMapping("/idcard/export/excel")
    public ResponseEntity<byte[]> exportPendingIdCardOrders() {

        byte[] excel = adminService.exportPendingIdCardOrdersToExcel();

        String fileName =
                "idcard_orders_" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excel.length)
                .body(excel);
    }




    //npm install @tanstack/react-query react-router-dom
}
