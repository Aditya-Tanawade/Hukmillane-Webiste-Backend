package com.Tshirt.Hukmillane_website_Backend.config;


import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {


    @Bean
    public ModelMapper getModelMapper(){
        return new ModelMapper();
    }
}
