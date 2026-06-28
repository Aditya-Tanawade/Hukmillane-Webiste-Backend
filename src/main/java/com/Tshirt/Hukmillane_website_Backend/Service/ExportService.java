package com.Tshirt.Hukmillane_website_Backend.Service;

public interface ExportService {

    byte[] exportPendingTshirtOrdersToExcel();

    byte[] exportPendingIdCardOrdersToExcel();

}
