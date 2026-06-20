package com.Tshirt.Hukmillane_website_Backend.Service;

import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.razorpay.RazorpayException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public interface IdCardService {
    public IdCardEntity createOrder(IdCardEntity idCardEntity, MultipartFile multipartFile) throws RazorpayException, IOException;

    public IdCardEntity updateStatus(Map<String, String> map) throws RazorpayException;

    public IdCardEntity downloadImage(String fileName);

}
