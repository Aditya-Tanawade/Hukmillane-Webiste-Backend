package com.Tshirt.Hukmillane_website_Backend.Service.impl;

import com.Tshirt.Hukmillane_website_Backend.DTO.ReceiptDTO;
import com.Tshirt.Hukmillane_website_Backend.entity.SizeQuantity;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async("emailExecutor")
    public void sendReceipt(ReceiptDTO order) {

        String subject =
                "Payment Successful Of Mandal-Tshirt  - Receipt #" + order.getBookingId();

        String html =
                        "<!DOCTYPE html>\n" +
                        "<html>\n" +
                        "<head>\n" +
                        "<meta charset=\"UTF-8\">\n" +
                        "<title>Payment Receipt</title>\n" +
                        "</head>\n" +
                        "\n" +
                        "<body style=\"margin:0;padding:20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;\">\n" +
                        "\n" +
                        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
                        "<tr>\n" +
                        "<td align=\"center\">\n" +
                        "\n" +
                        "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"\n" +
                        "       style=\"background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;\">\n" +
                        "\n" +
                        "    <!-- Header -->\n" +
                        "    <tr>\n" +
                        "        <td align=\"center\"\n" +
                        "            style=\"background:#b71c1c;color:#ffffff;padding:30px 20px;\">\n" +
                        "            <h1 style=\"margin:0;font-size:28px;\">\n" +
                        "                \uD83C\uDF89 || Hukmil Lanecha Raja ||\n" +
                        "            </h1>\n" +
                        "            <p style=\"margin-top:8px;font-size:14px;\">\n" +
                        "                Official Payment Receipt\n" +
                        "            </p>\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "    <!-- Success Badge -->\n" +
                        "    <tr>\n" +
                        "        <td align=\"center\" style=\"padding:20px;\">\n" +
                        "            <span style=\"\n" +
                        "                background:#dcfce7;\n" +
                        "                color:#166534;\n" +
                        "                padding:8px 16px;\n" +
                        "                border-radius:20px;\n" +
                        "                font-weight:bold;\n" +
                        "                font-size:14px;\">\n" +
                        "                ✅ Payment Successful\n" +
                        "            </span>\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "    <!-- Receipt Details -->\n" +
                        "    <tr>\n" +
                        "        <td style=\"padding:0 30px 20px 30px;\">\n" +
                        "\n" +
                        "            <table width=\"100%\" cellpadding=\"8\" cellspacing=\"0\" border=\"0\">\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Booking ID</td>\n" +
                        "                    <td align=\"right\">${BOOKING_ID}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Customer</td>\n" +
                        "                    <td align=\"right\">${CUSTOMER_NAME}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Phone</td>\n" +
                        "                    <td align=\"right\">${PHONE}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Email</td>\n" +
                        "                    <td align=\"right\">${EMAIL}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Order ID</td>\n" +
                        "                    <td align=\"right\"\n" +
                        "                        style=\"font-family:monospace;font-size:12px;\">\n" +
                        "                        ${ORDER_ID}\n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Payment ID</td>\n" +
                        "                    <td align=\"right\"\n" +
                        "                        style=\"font-family:monospace;font-size:12px;\">\n" +
                        "                        ${PAYMENT_ID}\n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Date</td>\n" +
                        "                    <td align=\"right\">${ORDER_DATE}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Status</td>\n" +
                        "                    <td align=\"right\" style=\"color:#166534;font-weight:bold;\">\n" +
                        "                        CONFIRMED\n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                                "\n" +
                                "       <tr>\n" +
                        "                    <td style=\"color:#777;font-weight:bold;\">Total Quantity</td>\n" +
                        "                    <td align=\"right\">${TOTAL_QUANTITY}</td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "            </table>\n" +
                        "\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "    <!-- Product Section -->\n" +
                        "    <tr>\n" +
                        "        <td style=\"padding:0 30px;\">\n" +
                        "\n" +
                        "            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"\n" +
                        "                   style=\"background:#fff8ef;border:1px solid #f3d8b0;border-radius:8px;\">\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"padding:15px;font-weight:bold;font-size:16px;color:#b71c1c;\">\n" +
                        "                        Mandal T-Shirt Order \n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "                <tr>\n" +
                        "                    <td style=\"padding:0 15px 15px 15px;\">\n" +
                        "\n" +
                        "                        <table width=\"100%\" cellpadding=\"8\" cellspacing=\"0\" border=\"0\">\n" +
                        "\n" +
                        "                            <tr style=\"background:#f8f8f8;\">\n" +
                        "                                <th align=\"left\">Size</th>\n" +
                        "                                <th align=\"center\">Quantity</th>\n" +
                        "                            </tr>\n" +
                        "\n" +
                        "                            ${SIZE_ROWS}\n" +
                        "\n" +
                        "                        </table>\n" +
                        "\n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                        "\n" +
                        "            </table>\n" +
                        "\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "    <!-- Total -->\n" +
                        "    <tr>\n" +
                        "        <td style=\"padding:25px 30px;\">\n" +
                        "\n" +
                        "            <table width=\"100%\">\n" +
                        "                <tr>\n" +
                        "                    <td style=\"font-size:22px;font-weight:bold;color:#b71c1c;\">\n" +
                        "                        Total Paid\n" +
                        "                    </td>\n" +
                        "\n" +
                        "                    <td align=\"right\"\n" +
                        "                        style=\"font-size:24px;font-weight:bold;color:#b71c1c;\">\n" +
                        "                        ₹${AMOUNT}\n" +
                        "                    </td>\n" +
                        "                </tr>\n" +
                        "            </table>\n" +
                        "\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "    <!-- Footer -->\n" +
                        "    <tr>\n" +
                        "        <td align=\"center\"\n" +
                        "            style=\"background:#fafafa;padding:20px;color:#777;font-size:13px;\">\n" +
                        "            Thank you for your order ❤\uFE0F<br>\n" +
                        "            Keep this receipt for your records.\n" +
                        "        </td>\n" +
                        "    </tr>\n" +
                        "\n" +
                        "</table>\n" +
                        "\n" +
                        "</td>\n" +
                        "</tr>\n" +
                        "</table>\n" +
                        "\n" +
                        "</body>\n" +
                        "</html>\n" +
                        "```\n";



        StringBuilder sizeRows = new StringBuilder();

        for (SizeQuantity sq : order.getSizeQuantities()) {
            sizeRows.append("""
        <tr>
            <td>%s</td>
            <td align="center">%s</td>
        </tr>
        """.formatted(
                    sq.getSize(),
                    sq.getQuantity()
            ));
        }


        html = html
                .replace("${BOOKING_ID}", String.valueOf(order.getBookingId()))
                .replace("${CUSTOMER_NAME}", order.getName())
                .replace("${PHONE}", order.getPhoneNumber())
                .replace("${EMAIL}", order.getEmail())
                .replace("${ORDER_ID}", order.getRazorpayOrderId())
                .replace("${PAYMENT_ID}", order.getRazorpayPaymentId())
                .replace("${ORDER_DATE}", order.getUpdatedAt().format(
                        DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a")))
                .replace("${AMOUNT}", String.valueOf(order.getAmount()))
                .replace("${SIZE_ROWS}", sizeRows.toString())
                .replace("${TOTAL_QUANTITY}", String.valueOf(order.getTotalQuantity()));


        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setTo(order.getEmail());
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
