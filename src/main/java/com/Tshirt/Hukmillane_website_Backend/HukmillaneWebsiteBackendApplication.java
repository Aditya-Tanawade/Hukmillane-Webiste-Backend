package com.Tshirt.Hukmillane_website_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HukmillaneWebsiteBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HukmillaneWebsiteBackendApplication.class, args);
	}

}
