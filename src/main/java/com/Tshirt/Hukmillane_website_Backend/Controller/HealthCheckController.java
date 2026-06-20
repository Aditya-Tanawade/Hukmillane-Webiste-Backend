package com.Tshirt.Hukmillane_website_Backend.Controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class HealthCheckController {

    @GetMapping("/")
    public ResponseEntity<String>healthCheckController(){
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/timezone")
    public String timezone() {
        return java.util.TimeZone.getDefault().getID();
    }

    @GetMapping("/test-time")
    public String testTime() {
        return LocalDateTime.now().toString();
    }

}
