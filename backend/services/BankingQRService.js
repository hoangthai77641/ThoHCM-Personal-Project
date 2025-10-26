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
   * Theo chuẩn VietQR - Sử dụng VietQR API
   */
  static async generateVietQR(params) {
    const {
      bankCode = '970436', // Vietcombank
      accountNumber,
      accountName,
      amount,
      description,
      template = 'compact2'
    } = params;

    try {
      // Sử dụng VietQR API để tạo QR chuẩn
      const vietQRUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
      
      // Fetch VietQR image từ API
      const fetch = require('node-fetch');
      const response = await fetch(vietQRUrl);
      
      if (!response.ok) {
        throw new Error(`VietQR API error: ${response.statusText}`);
      }
      
      // Convert to base64 data URL
      const buffer = await response.buffer();
      const qrCodeDataURL = `data:image/png;base64,${buffer.toString('base64')}`;

      return {
        qrCode: qrCodeDataURL,
        vietQRUrl,
        qrData: vietQRUrl, // Đây là URL VietQR thật
        bankInfo: {
          bankCode,
          accountNumber,
          accountName,
          amount,
          description
        }
      };
    } catch (error) {
      throw new Error(`Không thể tạo VietQR: ${error.message}`);
    }
  }

  /**
   * Build VietQR data theo chuẩn EMV
   */
  static buildVietQRData(params) {
    const { bankCode, accountNumber, amount, description } = params;
    
    // VietQR chuẩn EMV format
    // Format: 00020101021238570010A00000072701270006970436011{accountNumber}0208QRIBFTTD5303704540{amount}5802VN62{description}6304{checksum}
    
    // Simplified approach: Use VietQR API URL instead of custom format
    // This ensures banking apps can recognize the QR code
    const vietQRData = `00020101021238570010A000000727012700069${bankCode}01${accountNumber.length.toString().padStart(2, '0')}${accountNumber}0208QRIBFTTD5303704540${amount.toString().padStart(2, '0')}5802VN62${description.length.toString().padStart(2, '0')}${description}6304`;
    
    // For now, return the VietQR URL as this is more reliable
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
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