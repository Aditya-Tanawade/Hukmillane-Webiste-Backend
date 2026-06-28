package com.Tshirt.Hukmillane_website_Backend.Service.impl;


import com.Tshirt.Hukmillane_website_Backend.DTO.Product;
import com.Tshirt.Hukmillane_website_Backend.DTO.ReceiptDTO;
import com.Tshirt.Hukmillane_website_Backend.Repository.TshirtBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Service.TshirtService;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class TshirtServiceImpl implements TshirtService {

    private static final Logger logger =
            LoggerFactory.getLogger(TshirtServiceImpl.class);

    @Autowired
    private TshirtBookingRepo tshirtBookingRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ModelMapper modelMapper;

    @Value("${razorpay.api.key}")
    private String razorPayKey;

    @Value("${razorpay.api.secret}")
    private String razorPaySecret;

    private RazorpayClient razorpayClient;

    @Override
    public TShirtEntity createOrder(TShirtEntity tShirtEntity) throws RazorpayException {
        JSONObject orderRequest=new JSONObject();
        orderRequest.put("amount",tShirtEntity.getAmount() * 100);
        orderRequest.put("currency","INR");
        orderRequest.put("receipt",tShirtEntity.getEmail());
        this.razorpayClient=new RazorpayClient(razorPayKey,razorPaySecret);
        Order razorPayOrder=razorpayClient.orders.create(orderRequest);
        logger.info("Order Created Details By RazorPay {}" , razorPayOrder);

        tShirtEntity.setRazorpayOrderId(razorPayOrder.get("id"));
        tShirtEntity.setOrderStatus(razorPayOrder.get("status"));
        tShirtEntity.setRazorpayAttempts(razorPayOrder.get("attempts"));

        logger.info("Created Order Saving {}" , tShirtEntity);

        tshirtBookingRepo.save(tShirtEntity);
        return tShirtEntity;
    }


    @Override
    public TShirtEntity updateStatus(Map<String, String> response) throws RazorpayException {
        String razorpayId = response.get("razorpay_order_id");
        String razorpayPaymentId = response.get("razorpay_payment_id");
        String razorpaySignature = response.get("razorpay_signature");

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);

        boolean isValid =
                Utils.verifyPaymentSignature(options, razorPaySecret);
        logger.info("Razorpay Signature Status {}" ,isValid);



        if (isValid) {
            TShirtEntity order = tshirtBookingRepo.findByRazorpayOrderId(razorpayId);
            order.setOrderStatus("PAYMENT_SUCCESS");
            order.setDeliveryStatus(DeliveryStatus.PENDING);
            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setRazorpaySignature(razorpaySignature);
            TShirtEntity savedOrder = tshirtBookingRepo.save(order);

            ReceiptDTO emailDto=modelMapper.map(savedOrder,ReceiptDTO.class);

            if (savedOrder.getEmail() != null &&
                    !savedOrder.getEmail().isBlank()) {
                emailDto.setProduct(Product.TSHIRT);

                logger.info("Sending Email With Following Data {}" ,emailDto);
                emailService.sendReceipt(emailDto);

            }
            return  savedOrder;
        }

        throw new RazorpayException("PAYMENT FAILED");
    }
}
