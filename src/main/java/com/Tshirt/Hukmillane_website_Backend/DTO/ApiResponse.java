package com.Tshirt.Hukmillane_website_Backend.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
}
