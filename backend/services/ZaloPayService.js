const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');

class ZaloPayService {
  constructor() {
    // ZaloPay configuration - will be updated with real credentials
    this.app_id = process.env.ZALOPAY_APP_ID || '2553'; // TO BE REPLACED: Real APP_ID from ZaloPay
    this.key1 = process.env.ZALOPAY_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL'; // TO BE REPLACED: Real KEY1
    this.key2 = process.env.ZALOPAY_KEY2 || 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz'; // TO BE REPLACED: Real KEY2
    
    // Endpoints
    this.endpoint = process.env.NODE_ENV === 'production' 
      ? 'https://openapi.zalopay.vn'  // Production
      : 'https://sb-openapi.zalopay.vn'; // Sandbox
    
    this.callback_url = process.env.ZALOPAY_CALLBACK_URL || 
      (process.env.NODE_ENV === 'production' 
        ? `${process.env.SERVER_URL}/api/wallet/zalopay-callback`
        : 'http://localhost:5000/api/wallet/zalopay-callback');

    console.log('🟡 ZaloPayService initialized with:', {
      app_id: this.app_id,
      endpoint: this.endpoint,
      callback_url: this.callback_url,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Tạo đơn hàng ZaloPay
   */
  async createOrder(params) {
    const {
      amount,
      description,
      app_trans_id, // Transaction code from application
      app_user = 'user123'
    } = params;

    const embed_data = {
      redirecturl: 'http://localhost:3000/wallet'
    };

    const items = [{
      itemid: "wallet_topup",
      itemname: "Nạp ví điện tử",
      itemprice: amount,
      itemquantity: 1
    }];

    const order = {
      app_id: this.app_id,
      app_trans_id: app_trans_id,
      app_user: app_user,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: description,
      bank_code: "",
      callback_url: this.callback_url
    };

    // Create MAC for order
    const data = order.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

    try {
      const response = await axios.post(`${this.endpoint}/v2/create`, null, {
        params: order
      });

      return response.data;
    } catch (error) {
      console.error('ZaloPay create order error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái đơn hàng
   */
  async getOrderStatus(app_trans_id) {
    const data = {
      app_id: this.app_id,
      app_trans_id: app_trans_id
    };

    const dataString = data.app_id + "|" + data.app_trans_id + "|" + this.key1;
    data.mac = crypto.createHmac('sha256', this.key1).update(dataString).digest('hex');

    try {
      const response = await axios.post(`${this.endpoint}/v2/query`, null, {
        params: data
      });

      return response.data;
    } catch (error) {
      console.error('ZaloPay query error:', error);
      throw error;
    }
  }

  /**
   * Xác thực callback từ ZaloPay
   */
  verifyCallback(dataStr, reqMac) {
    const mac = crypto.createHmac('sha256', this.key2).update(dataStr).digest('hex');
    return mac === reqMac;
  }

  /**
   * Parse response code từ ZaloPay
   */
  getResponseMessage(return_code) {
    const messages = {
      1: 'Giao dịch successful',
      2: 'Giao dịch thất bại',
      3: 'Giao dịch đang xử lý'
    };

    return messages[return_code] || 'Lỗi không xác định';
  }

  /**
   * Kiểm tra giao dịch successful
   */
  isSuccessTransaction(return_code) {
    return return_code === 1;
  }
}

module.exports = ZaloPayService;