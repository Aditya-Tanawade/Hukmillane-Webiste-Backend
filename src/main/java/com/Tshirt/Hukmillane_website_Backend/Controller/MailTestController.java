package com.Tshirt.Hukmillane_website_Backend.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetSocketAddress;
import java.net.Socket;

@RestController
public class MailTestController {

    @GetMapping("/smtp-test")
    public String smtpTest() {
        try (Socket socket = new Socket()) {
            socket.connect(
                    new InetSocketAddress("smtp.gmail.com", 587),
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
}
