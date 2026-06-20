package com.Tshirt.Hukmillane_website_Backend.Controller;


import com.Tshirt.Hukmillane_website_Backend.Service.IdCardService;
import com.Tshirt.Hukmillane_website_Backend.Service.TshirtService;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/id-card/")
public class IdCardBookingController {

    @Autowired
    private IdCardService idCardService;

    @GetMapping("/hello")
    public String  run(){
        return "THIS IS IDCARD WEBSITE ";
    }


    @PostMapping("/createOrder")
    public ResponseEntity<IdCardEntity> createOrder(@RequestBody IdCardEntity orders, @RequestPart MultipartFile multipartFile) throws RazorpayException, IOException {
        IdCardEntity razorpayOrder = idCardService.createOrder(orders,multipartFile);
        return new ResponseEntity<>(razorpayOrder, HttpStatus.CREATED);
    }

    @PostMapping("/paymentCallback")
    public ResponseEntity<IdCardEntity> paymentCallback(@RequestParam Map<String, String> response) throws RazorpayException {
        System.out.println("This IS Response MAP " + response);
        IdCardEntity sucessOrder = idCardService.updateStatus(response);
        return new ResponseEntity<>(sucessOrder, HttpStatus.OK);
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<?>downloadImage(@PathVariable String fileName){
        IdCardEntity idCardEntity=idCardService.downloadImage(fileName);
       return ResponseEntity.status(HttpStatus.OK)
               .contentType(MediaType.valueOf(idCardEntity.getImageType()))
               .body(idCardEntity.getImageData());
    }
}
