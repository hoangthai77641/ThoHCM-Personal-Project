// Admin endpoint để cấu hình thông tin ngân hàng
const { PlatformFee } = require('../models/Wallet');
const BankingQRService = require('../services/BankingQRService');

// GET current banking config
exports.getBankingConfig = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể truy cập'
      });
    }

    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
      await platformFee.save();
    }

    res.json({
      success: true,
      data: {
        bankAccount: platformFee.bankAccount,
        feePercentage: platformFee.feePercentage,
        minTopup: platformFee.minTopup,
        maxTopup: platformFee.maxTopup
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE banking config  
exports.updateBankingConfig = async (req, res) => {
  try {
    // Only admin can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể cập nhật'
      });
    }

    const {
      bankName,
      accountNumber,
      accountName,
      feePercentage,
      minTopup,
      maxTopup
    } = req.body;

    // Validation
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin ngân hàng không đầy đủ'
      });
    }

    // Validate account number (basic)
    if (!/^\d{10,20}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Số tài khoản không hợp lệ (10-20 chữ số)'
      });
    }

    // Get bank code from bank name
    const bankCode = getBankCodeFromName(bankName);
    if (!bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Tên ngân hàng không được hỗ trợ'
      });
    }

    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
    }

    // Update banking info
    platformFee.bankAccount = {
      bankName,
      bankCode,
      accountNumber,
      accountName: accountName.toUpperCase()
    };

    // Update fee config if provided
    if (feePercentage !== undefined) platformFee.feePercentage = feePercentage;
    if (minTopup !== undefined) platformFee.minTopup = minTopup;
    if (maxTopup !== undefined) platformFee.maxTopup = maxTopup;

    await platformFee.save();

    // Test QR generation with new info
    try {
      const testQR = await BankingQRService.generateVietQR({
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountName: accountName,
        amount: 100000,
        description: 'TEST QR'
      });

      res.json({
        success: true,
        message: 'Cập nhật thông tin ngân hàng thành công',
        data: {
          bankAccount: platformFee.bankAccount,
          feeConfig: {
            feePercentage: platformFee.feePercentage,
            minTopup: platformFee.minTopup,
            maxTopup: platformFee.maxTopup
          },
          qrTest: {
            success: true,
            message: 'QR code tạo thành công'
          }
        }
      });
    } catch (qrError) {
      res.json({
        success: true,
        message: 'Thông tin ngân hàng đã lưu, nhưng có lỗi tạo QR',
        data: {
          bankAccount: platformFee.bankAccount,
          qrTest: {
            success: false,
            error: qrError.message
          }
        }
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// TEST QR generation with current config
exports.testQRGeneration = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể test'
      });
    }

    const { amount = 100000 } = req.body;

    let platformFee = await PlatformFee.findOne();
    if (!platformFee || !platformFee.bankAccount) {
      return res.status(400).json({
        success: false,
        message: 'Chưa cấu hình thông tin ngân hàng'
      });
    }

    const qrResult = await BankingQRService.generateVietQR({
      bankCode: platformFee.bankAccount.bankCode || '970436',
      accountNumber: platformFee.bankAccount.accountNumber,
      accountName: platformFee.bankAccount.accountName,
      amount: amount,
      description: 'TEST NAPVI'
    });

    const bankingLinks = BankingQRService.generateBankingLinks({
      accountNumber: platformFee.bankAccount.accountNumber,
      amount: amount,
      description: 'TEST NAPVI'
    });

    res.json({
      success: true,
      message: 'Test QR thành công',
      data: {
        qrCode: qrResult.qrCode,
        bankInfo: qrResult.bankInfo,
        bankingLinks: bankingLinks,
        vietQRUrl: `https://img.vietqr.io/image/${platformFee.bankAccount.bankCode || '970436'}-${platformFee.bankAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=TEST%20NAPVI&accountName=${encodeURIComponent(platformFee.bankAccount.accountName)}`
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

// Helper function to get bank code from name
function getBankCodeFromName(bankName) {
  const bankMapping = {
    'vietcombank': '970436',
    'techcombank': '970407', 
    'mbbank': '970422',
    'vpbank': '970432',
    'vietinbank': '970415',
    'sacombank': '970403',
    'ocb': '970448',
    'vietcapitalbank': '970454',
    'acb': '970416',
    'bidv': '970418'
  };

  const normalizedName = bankName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/bank$/, '')
    .replace(/^ngan\s*hang\s*/i, '');

  return bankMapping[normalizedName];
}

module.exports = {
  getBankingConfig: exports.getBankingConfig,
  updateBankingConfig: exports.updateBankingConfig,
  testQRGeneration: exports.testQRGeneration
};