package com.Tshirt.Hukmillane_website_Backend.Service.impl;

import com.Tshirt.Hukmillane_website_Backend.Repository.IdCardBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Repository.TshirtBookingRepo;
import com.Tshirt.Hukmillane_website_Backend.Service.ExportService;
import com.Tshirt.Hukmillane_website_Backend.entity.IdCardEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.SizeQuantity;
import com.Tshirt.Hukmillane_website_Backend.entity.TShirtEntity;
import com.Tshirt.Hukmillane_website_Backend.entity.enums.DeliveryStatus;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExportServiceImpl implements ExportService {

    @Autowired
    private TshirtBookingRepo tshirtBookingRepo;

    @Autowired
    private IdCardBookingRepo idCardBookingRepo;

    @Override
    public byte[] exportPendingTshirtOrdersToExcel() {

        List<TShirtEntity> orders =
                tshirtBookingRepo.findByOrderStatus("PAYMENT_SUCCESS");

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("TShirt Orders");

            createTshirtHeader(sheet);

            int rowNum = 1;

            for (TShirtEntity order : orders) {

                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(order.getBookingId());
                row.createCell(1).setCellValue(order.getName());
                row.createCell(2).setCellValue(order.getEmail());
                row.createCell(3).setCellValue(order.getPhoneNumber());
                row.createCell(4).setCellValue(order.getAmount());
                row.createCell(5).setCellValue(order.getTotalQuantity());

                row.createCell(6).setCellValue(getSizeDetails(order));

                row.createCell(7).setCellValue(order.getOrderStatus());

                row.createCell(8).setCellValue(
                        order.getDeliveryStatus().name());

                row.createCell(9).setCellValue(
                        order.getCreatedAt().toString());

            }

            autoSize(sheet,10);

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            workbook.write(outputStream);

            return outputStream.toByteArray();

        } catch (IOException e) {

            throw new RuntimeException("Unable to export excel", e);

        }

    }

    @Override
    public byte[] exportPendingIdCardOrdersToExcel() {

        List<IdCardEntity> orders =
                idCardBookingRepo.findByDeliveryStatus(DeliveryStatus.PENDING);

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet(" ID-Card Orders");

            createIdCardHeader(sheet);

            int rowNum = 1;

            for (IdCardEntity order : orders) {

                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(order.getBookingId());
                row.createCell(1).setCellValue(order.getIdCardHolderName());
                row.createCell(2).setCellValue(order.getName());
                row.createCell(3).setCellValue(order.getEmail());
                row.createCell(4).setCellValue(order.getPhoneNumber());
                row.createCell(5).setCellValue(order.getAmount());
                row.createCell(6).setCellValue(order.getTotalQuantity());
                row.createCell(7).setCellValue(order.getOrderStatus());

                row.createCell(8).setCellValue(
                        order.getDeliveryStatus().name());

                row.createCell(9).setCellValue(
                        order.getCreatedAt().toString());

            }

            autoSize(sheet,10);

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            workbook.write(outputStream);

            return outputStream.toByteArray();

        } catch (IOException e) {

            throw new RuntimeException("Unable to export excel", e);

        }

    }

    private void createTshirtHeader(Sheet sheet){

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Booking Id");
        header.createCell(1).setCellValue("Customer Name");
        header.createCell(2).setCellValue("Email");
        header.createCell(3).setCellValue("Phone");
        header.createCell(4).setCellValue("Amount");
        header.createCell(5).setCellValue("Total Qty");
        header.createCell(6).setCellValue("Sizes");
        header.createCell(7).setCellValue("Payment Status");
        header.createCell(8).setCellValue("Delivery Status");
        header.createCell(9).setCellValue("Created At");

    }

    private void createIdCardHeader(Sheet sheet){

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Booking Id");
        header.createCell(1).setCellValue("ID Holder Name");
        header.createCell(2).setCellValue("Booked By");
        header.createCell(3).setCellValue("Email");
        header.createCell(4).setCellValue("Phone");
        header.createCell(5).setCellValue("Amount");
        header.createCell(6).setCellValue("Quantity");
        header.createCell(7).setCellValue("Payment Status");
        header.createCell(8).setCellValue("Delivery Status");
        header.createCell(9).setCellValue("Created At");

    }

    private String getSizeDetails(TShirtEntity entity){

        StringBuilder builder = new StringBuilder();

        for(SizeQuantity sq : entity.getSizeQuantities()){

            builder.append("SIZE "+sq.getSize())
                    .append(" : ")
                    .append(sq.getQuantity())
                    .append(" ");

        }

        return builder.toString();

    }

    private void autoSize(Sheet sheet,int columns){

        for(int i=0;i<columns;i++){

            sheet.autoSizeColumn(i);

        }

    }

}