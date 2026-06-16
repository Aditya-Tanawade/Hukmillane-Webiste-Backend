package com.Tshirt.Hukmillane_website_Backend.Controller;

import com.Tshirt.Hukmillane_website_Backend.DTO.ReceiptDTO;
import com.Tshirt.Hukmillane_website_Backend.Service.EmailService;
import com.Tshirt.Hukmillane_website_Backend.entity.SizeQuantity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.LocalDateTime;
import java.util.List;

@RestController
public class MailTestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/smtp-test")
    public String smtpTest() {
        try (Socket socket = new Socket()) {
            socket.connect(
                    new InetSocketAddress("smtp-relay.brevo.com", 587),
                    10000
            );
            return "CONNECTED";
        } catch (Exception e) {
            return e.toString();
        }
    }

    @GetMapping("/smtp-test-2")
    public String smtpTest2() {
        return "OK";
    }

    @GetMapping("/email-test")
    public String emailTest(@RequestParam String to) {
        SizeQuantity sizeQuantity = new SizeQuantity();
        sizeQuantity.setSize("38");
        sizeQuantity.setQuantity(1);

        ReceiptDTO receipt = new ReceiptDTO();
        receipt.setBookingId(1001);
        receipt.setName("Test Customer");
        receipt.setEmail(to);
        receipt.setPhoneNumber("9999999999");
        receipt.setAmount(1);
        receipt.setSizeQuantities(List.of(sizeQuantity));
        receipt.setTotalQuantity(1);
        receipt.setUpdatedAt(LocalDateTime.now());
        receipt.setRazorpayOrderId("order_test_email");
        receipt.setRazorpayPaymentId("pay_test_email");

        emailService.sendReceipt(receipt);
        return "Test receipt email queued for " + to;
    }
}
