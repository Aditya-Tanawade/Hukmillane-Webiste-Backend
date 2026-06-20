package com.Tshirt.Hukmillane_website_Backend.Controller;


import com.Tshirt.Hukmillane_website_Backend.Service.TshirtService;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Map;


@RestController
@RequestMapping("/tshirt/")
//@CrossOrigin(origins = "http://localhost:5173")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "https://hukmillanecharaja.vercel.app",
                "https://hukmillanecharaja.in",
                "https://www.hukmillanecharaja.in"
        }
)
public class TshirtBookingController {

    @Autowired
    private TshirtService tshirtService;

    @GetMapping("/hello")
    public String  run(){
        return "THIS IS NEW WEBSITE ";
    }


    @GetMapping("/test")
    public String test() {
        try (Socket socket = new Socket()) {
            socket.connect(
                    new InetSocketAddress("smtp.gmail.com", 587),
                    10000
            );
            return "Connected";
        } catch (Exception e) {
            return e.toString();
        }
    }

    @PostMapping("/createOrder")
    public ResponseEntity<TShirtEntity> createOrder(@RequestBody TShirtEntity orders) throws RazorpayException {
        TShirtEntity razorpayOrder = tshirtService.createOrder(orders);
        return new ResponseEntity<>(razorpayOrder, HttpStatus.CREATED);
    }

    @PostMapping("/paymentCallback")
    public ResponseEntity<TShirtEntity> paymentCallback(@RequestParam Map<String, String> response) throws RazorpayException {
        System.out.println("This IS Response MAP " + response);
        TShirtEntity sucessOrder = tshirtService.updateStatus(response);
        return new ResponseEntity<>(sucessOrder, HttpStatus.OK);
    }
}
