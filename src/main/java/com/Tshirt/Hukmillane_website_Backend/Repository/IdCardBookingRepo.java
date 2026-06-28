package com.Tshirt.Hukmillane_website_Backend.Repository;

import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IdCardBookingRepo extends JpaRepository<IdCardEntity,Integer> {

    IdCardEntity findByRazorpayOrderId(String razorpayId);

    Optional<IdCardEntity> findByImageName(String imageName);

    @Query("SELECT COUNT(t) FROM IdCardEntity t WHERE t.orderStatus = 'PAYMENT_SUCCESS'")
    Integer getPaymentSuccessIdCardCount();

    // Pending delivery count
    @Query("SELECT COUNT(t) FROM IdCardEntity t WHERE t.deliveryStatus = 'PENDING'")
    Integer getIdCardPendingDeliveryCount();

    // Delivered count
    @Query("SELECT COUNT(t) FROM IdCardEntity t WHERE t.deliveryStatus = 'DELIVERED'")
    Integer getIdCardDeliveredCount();

    // Total revenue
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM IdCardEntity t WHERE t.orderStatus = 'PAYMENT_SUCCESS'")
    Integer getIdCardRevenue();

    List<IdCardEntity> findByDeliveryStatus(DeliveryStatus deliveryStatus);

    List<IdCardEntity> findByOrderStatus(String OrderStatus);

}
