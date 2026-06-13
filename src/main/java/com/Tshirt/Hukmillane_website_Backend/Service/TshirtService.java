package com.Tshirt.Hukmillane_website_Backend.Service;

import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.razorpay.RazorpayException;
import org.springframework.stereotype.Service;

import java.util.Map;
@Service
public interface TshirtService {

    public TShirtEntity createOrder(TShirtEntity tShirtEntity) throws RazorpayException;

    public TShirtEntity updateStatus(Map<String, String> map) throws RazorpayException;
}
