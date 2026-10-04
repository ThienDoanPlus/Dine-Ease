package com.dineease.dto;

import lombok.Getter;
import lombok.Setter;

//Dùng class thay vì record để setter có thể hoạt động với @RequestParam
@Getter
@Setter
public class VnpayIpnRequest {
    private String vnp_Amount;
    private String vnp_BankCode;
    private String vnp_CardType;
    private String vnp_OrderInfo;
    private String vnp_PayDate;
    private String vnp_ResponseCode;
    private String vnp_TmnCode;
    private String vnp_TransactionNo;
    private String vnp_TransactionStatus;
    private String vnp_TxnRef; // Mã đơn hàng của mình
    private String vnp_SecureHash;
}
