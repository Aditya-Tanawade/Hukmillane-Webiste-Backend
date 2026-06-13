package com.Tshirt.Hukmillane_website_Backend.Repository;

import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TshirtBookingRepo extends JpaRepository<TShirtEntity,Integer> {


    TShirtEntity findByRazorpayOrderId(String razorpayId);
}
