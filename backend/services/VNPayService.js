const crypto = require('crypto');
const moment = require('moment');
const qs = require('querystring');

class VNPayService {
  constructor() {
    // VNPay configuration - sử dụng sandbox cho test
    this.vnp_TmnCode = process.env.VNP_TMN_CODE || 'VNPAYSANDBOX'; // Mã website tại VNPay
    this.vnp_HashSecret = process.env.VNP_HASH_SECRET || 'SANDBOXHASHSECRET'; // Chuỗi bí mật
    this.vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnp_Api = process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/wallet/vnpay-return';
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl(params) {
    const {
      amount,
      orderInfo,
      orderType = 'other',
      txnRef,
      ipAddr,
      createDate = moment().format('YYYYMMDDHHmmss'),
      locale = 'vn'
    } = params;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay tính bằng đồng (x100)
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sắp xếp tham số theo thứ tự alphabet
    vnp_Params = this.sortObject(vnp_Params);

    // Tạo query string
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    // Tạo secure hash
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnp_Params['vnp_SecureHash'] = signed;
    
    // Tạo URL cuối cùng
    const paymentUrl = this.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
    
    return {
      paymentUrl,
      vnp_Params
    };
  }

  /**
   * Xác thực chữ ký từ VNPay
   */
  verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sắp xếp tham số
    vnpParams = this.sortObject(vnpParams);
    
    // Tạo lại chữ ký
    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return signed === secureHash;
  }

  /**
   * Kiểm tra trạng thái giao dịch
   */
  async queryTransaction(params) {
    const {
      txnRef,
      transDate,
      ipAddr = '127.0.0.1'
    } = params;

    let vnp_Params = {};
    vnp_Params['vnp_Command'] = 'querydr';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = `Kiem tra giao dich ${txnRef}`;
    vnp_Params['vnp_TransDate'] = transDate;
    vnp_Params['vnp_CreateDate'] = moment().format('YYYYMMDDHHmmss');
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_Version'] = '2.1.0';

    // Sắp xếp tham số
    vnp_Params = this.sortObject(vnp_Params);
    
    // Tạo secure hash
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnp_Params['vnp_SecureHash'] = signed;

    try {
      const axios = require('axios');
      const response = await axios.post(this.vnp_Api, vnp_Params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('VNPay query error:', error);
      throw error;
    }
  }

  /**
   * Sắp xếp object theo key
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Parse response code từ VNPay
   */
  getResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }

  /**
   * Kiểm tra giao dịch thành công
   */
  isSuccessTransaction(responseCode) {
    return responseCode === '00';
  }
}

module.exports = VNPayService;