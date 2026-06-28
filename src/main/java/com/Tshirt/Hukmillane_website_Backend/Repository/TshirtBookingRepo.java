package com.Tshirt.Hukmillane_website_Backend.Repository;

import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface TshirtBookingRepo extends JpaRepository<TShirtEntity,Integer> {


    TShirtEntity findByRazorpayOrderId(String razorpayId);

    // Total successful payments count
    @Query("SELECT COUNT(t) FROM TShirtEntity t WHERE t.orderStatus = 'PAYMENT_SUCCESS'")
    Integer getPaymentSuccessTshirtCount();

    // Pending delivery count
    @Query("SELECT COUNT(t) FROM TShirtEntity t WHERE t.deliveryStatus = 'PENDING'")
    Integer getTshirtPendingDeliveryCount();

    // Delivered count
    @Query("SELECT COUNT(t) FROM TShirtEntity t WHERE t.deliveryStatus = 'DELIVERED'")
    Integer getTshirtDeliveredCount();

    // Total revenue
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TShirtEntity t WHERE t.orderStatus = 'PAYMENT_SUCCESS'")
    Integer getTshirtRevenue();

    List<TShirtEntity> findByDeliveryStatus(DeliveryStatus deliveryStatus);

    List<TShirtEntity> findByOrderStatus(String OrderStatus);


}
