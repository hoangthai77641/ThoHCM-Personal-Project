const QRCode = require('qrcode');

class BankingQRService {
  /**
   * Tạo QR code chuyển khoản ngân hàng Việt Nam cho manual deposit
   * Theo chuẩn VietQR
   */
  static async generateDepositQR(params) {
    const {
      bankCode = '970436', // Vietcombank
      accountNumber,
      accountName,
      amount,
      transactionId, // Unique transaction ID để tracking
      workerName,
      template = 'compact'
    } = params;

    // Tạo mã giao dịch unique để tracking
    const description = `THOHCM ${transactionId} ${workerName}`.substring(0, 25);

    return await this.generateVietQR({
      bankCode,
      accountNumber,
      accountName,
      amount,
      description,
      template
    });
  }

  /**
   * Tạo QR code chuyển khoản ngân hàng Việt Nam
   * Theo chuẩn VietQR
   */
  static async generateVietQR(params) {
    const {
      bankCode = '970436', // Vietcombank
      accountNumber,
      accountName,
      amount,
      description,
      template = 'compact'
    } = params;

    // VietQR format theo chuẩn EMV
    const qrData = this.buildVietQRData({
      bankCode,
      accountNumber,
      amount,
      description
    });

    try {
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return {
        qrCode: qrCodeDataURL,
        qrData,
        bankInfo: {
          bankCode,
          accountNumber,
          accountName,
          amount,
          description
        }
      };
    } catch (error) {
      throw new Error(`Không thể tạo QR code: ${error.message}`);
    }
  }

  /**
   * Build VietQR data theo chuẩn
   */
  static buildVietQRData(params) {
    const { bankCode, accountNumber, amount, description } = params;
    
    // Simplified VietQR format (basic)
    // Production should use proper EMV format
    const qrData = `BANK:${bankCode}|ACC:${accountNumber}|AMT:${amount}|DESC:${description}`;
    
    return qrData;
  }

  /**
   * Tạo deep link cho banking apps
   */
  static generateBankingLinks(params) {
    const { bankCode, accountNumber, amount, description } = params;
    
    const links = {
      // Vietcombank
      vcb: `vcb://transfer?accountNumber=${accountNumber}&amount=${amount}&description=${encodeURIComponent(description)}`,
      
      // Techcombank  
      tcb: `tcb://transfer?beneficiaryAccount=${accountNumber}&amount=${amount}&memo=${encodeURIComponent(description)}`,
      
      // MBBank
      mb: `mb://transfer?toAccount=${accountNumber}&amount=${amount}&content=${encodeURIComponent(description)}`,
      
      // VPBank
      vpbank: `vpbank://transfer?account=${accountNumber}&amount=${amount}&note=${encodeURIComponent(description)}`,
      
      // Generic banking URL (fallback)
      generic: `banking://transfer?account=${accountNumber}&amount=${amount}&note=${encodeURIComponent(description)}`
    };

    return links;
  }

  /**
   * Parse transaction reference để tracking
   */
  static generateTransactionRef(workerId, timestamp = Date.now()) {
    const ref = `TH${workerId.slice(-4).toUpperCase()}${timestamp.toString().slice(-6)}`;
    return ref;
  }

  /**
   * Validate transaction reference
   */
  static validateTransactionRef(ref, workerId) {
    if (!ref || ref.length !== 10) return false;
    
    const workerSuffix = workerId.slice(-4).toUpperCase();
    const refWorkerPart = ref.slice(2, 6);
    
    return refWorkerPart === workerSuffix;
  }

  /**
   * Bank codes mapping (Vietnam)
   */
  static getBankInfo(bankCode) {
    const banks = {
      '970436': { name: 'Vietcombank', shortName: 'VCB' },
      '970407': { name: 'Techcombank', shortName: 'TCB' },
      '970422': { name: 'MBBank', shortName: 'MB' },
      '970432': { name: 'VPBank', shortName: 'VP' },
      '970415': { name: 'Vietinbank', shortName: 'CTG' },
      '970403': { name: 'Sacombank', shortName: 'STB' },
      '970448': { name: 'OCB', shortName: 'OCB' },
      '970454': { name: 'VietCapitalBank', shortName: 'BVB' }
    };

    return banks[bankCode] || { name: 'Unknown', shortName: 'UNK' };
  }
}

module.exports = BankingQRService;