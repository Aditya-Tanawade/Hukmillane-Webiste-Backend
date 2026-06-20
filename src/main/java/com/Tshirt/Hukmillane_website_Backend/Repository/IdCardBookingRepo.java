package com.Tshirt.Hukmillane_website_Backend.Repository;

import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdCardBookingRepo extends JpaRepository<IdCardEntity,Integer> {

    IdCardEntity findByRazorpayOrderId(String razorpayId);

    Optional<IdCardEntity> findByImageName(String imageName);

}
