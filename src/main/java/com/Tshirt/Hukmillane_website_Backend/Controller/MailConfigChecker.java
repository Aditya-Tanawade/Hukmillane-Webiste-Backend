package com.Tshirt.Hukmillane_website_Backend.Controller;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class MailConfigChecker {

    @Autowired
    Environment env;

    @PostConstruct
    public void check() {
        System.out.println("MAIL HOST = " +
                env.getProperty("spring.mail.host"));

        System.out.println("MAIL PORT = " +
                env.getProperty("spring.mail.port"));
    }
}