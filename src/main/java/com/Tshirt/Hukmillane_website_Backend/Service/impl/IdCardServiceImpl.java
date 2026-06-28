package com.Tshirt.Hukmillane_website_Backend.Service.impl;

import com.Tshirt.Hukmillane_website_Backend.DTO.Product;
import com.Tshirt.Hukmillane_website_Backend.DTO.ReceiptDTO;
import com.Tshirt.Hukmillane_website_Backend.Repository.IdCardBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Repository.TshirtBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Service.IdCardService;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Service
public class IdCardServiceImpl implements IdCardService {
    private static final Logger logger =
            LoggerFactory.getLogger(IdCardServiceImpl.class);

    @Autowired
    private IdCardBookingRepo idCardBookingRepo;

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
    public IdCardEntity createOrder(IdCardEntity idCardEntity,
                                    MultipartFile multipartFile)
            throws RazorpayException, IOException {

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", idCardEntity.getAmount() * 100);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", idCardEntity.getEmail());

        this.razorpayClient = new RazorpayClient(razorPayKey, razorPaySecret);
        Order razorPayOrder = razorpayClient.orders.create(orderRequest);

        idCardEntity.setRazorpayOrderId(razorPayOrder.get("id"));
        idCardEntity.setOrderStatus(razorPayOrder.get("status"));
        idCardEntity.setRazorpayAttempts(razorPayOrder.get("attempts"));

        // First save to generate bookingId
        idCardEntity = idCardBookingRepo.save(idCardEntity);

        String originalFileName = multipartFile.getOriginalFilename();
        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        idCardEntity.setImageName(
                idCardEntity.getIdCardHolderName()+"_" + idCardEntity.getBookingId() + extension
        );
        idCardEntity.setImageType(multipartFile.getContentType());
        idCardEntity.setImageData(multipartFile.getBytes());

        // Save again with image details
        return idCardBookingRepo.save(idCardEntity);
    }


    @Override
    public IdCardEntity updateStatus(Map<String, String> response) throws RazorpayException {
        String razorpayId = response.get("razorpay_order_id");
        String razorpayPaymentId = response.get("razorpay_payment_id");
        String razorpaySignature = response.get("razorpay_signature");

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);

        boolean isValid =
                Utils.verifyPaymentSignature(options, razorPaySecret);


        if (isValid) {
            IdCardEntity order = idCardBookingRepo.findByRazorpayOrderId(razorpayId);
            order.setOrderStatus("PAYMENT_SUCCESS");
            order.setDeliveryStatus(DeliveryStatus.PENDING);
            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setRazorpaySignature(razorpaySignature);
            IdCardEntity savedOrder = idCardBookingRepo.save(order);

            ReceiptDTO emailDto=modelMapper.map(savedOrder,ReceiptDTO.class);

            if (savedOrder.getEmail() != null &&
                    !savedOrder.getEmail().isBlank()) {
                emailDto.setProduct(Product.IDCARD);
                logger.info("Sending Email With Following Data {}" ,emailDto);
                emailService.sendReceipt(emailDto);
            }
            return  savedOrder;
        }


        throw new RazorpayException("PAYMENT FAILED");
    }


    @Override
    public IdCardEntity downloadImage(String fileName){
         return  idCardBookingRepo.findByImageName(fileName).orElse(null);
    }
}
