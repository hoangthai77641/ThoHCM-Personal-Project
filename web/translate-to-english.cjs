const fs = require('fs');
const path = require('path');

/**
 * Auto-replace Vietnamese UI messages with English equivalents in React components
 */

const VIETNAMESE_TO_ENGLISH = {
  // Alert messages
  "alert('Vui lòng chọn thời gian và nhập địa chỉ')": "alert(UI_MESSAGES.FORMS.SELECT_TIME_ADDRESS)",
  "alert('Địa chỉ phải có ít nhất 10 ký tự')": "alert(UI_MESSAGES.FORMS.ADDRESS_MIN_LENGTH)",
  "alert('Không tìm thấy thông tin thợ cho dịch vụ này')": "alert(UI_MESSAGES.BOOKING.WORKER_NOT_FOUND)",
  "alert('Không thể đặt lịch cho thời gian đã qua. Vui lòng chọn thời gian trong tương lai.')": "alert(UI_MESSAGES.BOOKING.PAST_TIME_ERROR)",
  "alert('Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập lại.')": "alert(UI_MESSAGES.BOOKING.UNAUTHORIZED)",
  "alert('Hủy đơn thành công!')": "alert(UI_MESSAGES.BOOKING.CANCELLED)",
  "alert('Khung giờ này không khả dụng')": "alert(UI_MESSAGES.BOOKING.TIME_SLOT_UNAVAILABLE)",
  "alert('Vui lòng đăng nhập để đặt lịch')": "alert(UI_MESSAGES.FORMS.LOGIN_REQUIRED)",
  "alert('Vui lòng điền đầy đủ thông tin')": "alert(UI_MESSAGES.FORMS.INVALID_INPUT)",
  "alert('Lỗi kết nối server')": "alert(UI_MESSAGES.BOOKING.CONNECTION_ERROR)",
  "alert('Vui lòng chọn dịch vụ và nhập địa chỉ')": "alert(UI_MESSAGES.FORMS.SELECT_TIME_ADDRESS)",

  // Success messages
  "alert('Đặt lịch thành công!')": "alert(UI_MESSAGES.BOOKING.SUCCESS)",

  // Error handling patterns
  "alert(`Thông tin không hợp lệ:\\n${errorMessages}`)": "alert(formatMessage(ERROR_TEMPLATES.VALIDATION_ERRORS, { errors: errorMessages }))",
  "alert(`Lỗi: ${errorMessage}`)": "alert(formatMessage(ERROR_TEMPLATES.GENERAL_ERROR, { message: errorMessage }))",
  "alert(`Xung đột lịch: ${errorMessage}`)": "alert(formatMessage(ERROR_TEMPLATES.SCHEDULE_CONFLICT, { message: errorMessage }))",
  "alert(`Lỗi không xác định: ${errorMessage}`)": "alert(formatMessage(ERROR_TEMPLATES.UNKNOWN_ERROR, { message: errorMessage }))",

  // UI Text replacements
  "'Thông tin dịch vụ'": "UI_MESSAGES.SERVICE.TITLE",
  "'Dịch vụ:'": "UI_MESSAGES.SERVICE.SERVICE_LABEL",
  "'Đánh giá dịch vụ'": "UI_MESSAGES.REVIEW.SECTION_TITLE",
  "'Đánh giá:'": "UI_MESSAGES.REVIEW.RATING_LABEL",
  "'Nhận xét:'": "UI_MESSAGES.REVIEW.COMMENT_LABEL",
  "'Chia sẻ trải nghiệm của bạn về dịch vụ này...'": "UI_MESSAGES.REVIEW.COMMENT_PLACEHOLDER",
  "'Gửi đánh giá'": "UI_MESSAGES.REVIEW.SUBMIT_BUTTON",
  "'Đang gửi...'": "UI_MESSAGES.REVIEW.SUBMITTING_BUTTON",
  "'Địa chỉ *'": "UI_MESSAGES.SERVICE.ADDRESS_LABEL",
  "'Ghi chú'": "UI_MESSAGES.SERVICE.NOTE_LABEL",
  "'Nhập địa chỉ cần thực hiện dịch vụ'": "UI_MESSAGES.SERVICE.ADDRESS_PLACEHOLDER",
  "'Nhập ghi chú (không bắt buộc)'": "UI_MESSAGES.SERVICE.NOTE_PLACEHOLDER",

  // Button text
  "'Giao diện'": "UI_MESSAGES.NAVIGATION.THEME_TOGGLE",
  "'Thử lại'": "UI_MESSAGES.ACTIONS.RETRY",

  // Date formatting
  "toLocaleDateString('vi-VN'": "toLocaleDateString(UI_MESSAGES.DATE_FORMAT.LOCALE",
  "toLocaleString('vi-VN')": "toLocaleString(UI_MESSAGES.DATE_FORMAT.LOCALE)",

  // Admin messages
  "'Đã phê duyệt thành công'": "UI_MESSAGES.ADMIN.APPROVE_SUCCESS",
  "'Đã tạm khóa tài khoản'": "UI_MESSAGES.ADMIN.SUSPEND_SUCCESS",
  "'Chưa có địa chỉ'": "UI_MESSAGES.ADMIN.NO_ADDRESS",
  "'✅ Phê duyệt'": "UI_MESSAGES.ADMIN.APPROVE_BUTTON",

  // Banner management
  "'Vui lòng đăng nhập lại'": "UI_MESSAGES.BANNER.LOGIN_AGAIN",
  "'Cập nhật banner thành công!'": "UI_MESSAGES.BANNER.UPDATE_SUCCESS",
  "'Tạo banner thành công!'": "UI_MESSAGES.BANNER.CREATE_SUCCESS",
  "'Vui lòng chọn ảnh cho banner'": "UI_MESSAGES.BANNER.SELECT_IMAGE",
  "'Xóa banner thành công!'": "UI_MESSAGES.BANNER.DELETE_SUCCESS",

  // Review messages
  "'Vui lòng chọn số sao đánh giá'": "UI_MESSAGES.REVIEW.RATING_REQUIRED",
  "'Đánh giá của bạn đã được gửi thành công!'": "UI_MESSAGES.REVIEW.SUCCESS_MESSAGE",
  "'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.'": "UI_MESSAGES.REVIEW.ERROR_MESSAGE",

  // User management
  "'Không thể tải thông tin đơn hàng'": "UI_MESSAGES.USERS.BOOKING_LOAD_ERROR",
  "'Mật khẩu phải có ít nhất 6 ký tự'": "UI_MESSAGES.FORMS.PASSWORD_MIN_LENGTH",
  "'Mật khẩu mới phải có ít nhất 6 ký tự'": "UI_MESSAGES.FORMS.NEW_PASSWORD_MIN_LENGTH",
  "'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.'": "UI_MESSAGES.USERS.PASSWORD_RESET_SUCCESS",

  // Worker status
  "'Thợ hiện đang tạm nghỉ. Vui lòng chọn dịch vụ khác.'": "UI_MESSAGES.SERVICE.WORKER_OFFLINE"
};

// JSX element replacements
const JSX_REPLACEMENTS = {
  // Headers
  '<h3>Thông tin dịch vụ</h3>': '<h3>{UI_MESSAGES.SERVICE.TITLE}</h3>',
  '<h3>Đánh giá dịch vụ</h3>': '<h3>{UI_MESSAGES.REVIEW.SECTION_TITLE}</h3>',
  
  // Labels
  '<label>Địa chỉ *</label>': '<label>{UI_MESSAGES.SERVICE.ADDRESS_LABEL}</label>',
  '<label>Ghi chú</label>': '<label>{UI_MESSAGES.SERVICE.NOTE_LABEL}</label>',
  '<label>Đánh giá:</label>': '<label>{UI_MESSAGES.REVIEW.RATING_LABEL}</label>',
  '<label htmlFor="comment">Nhận xét:</label>': '<label htmlFor="comment">{UI_MESSAGES.REVIEW.COMMENT_LABEL}</label>',

  // Paragraphs and text
  '<p><strong>Dịch vụ:</strong>': '<p><strong>{UI_MESSAGES.SERVICE.SERVICE_LABEL}</strong>',
  
  // Placeholders
  'placeholder="Nhập địa chỉ cần thực hiện dịch vụ"': 'placeholder={UI_MESSAGES.SERVICE.ADDRESS_PLACEHOLDER}',
  'placeholder="Nhập ghi chú (không bắt buộc)"': 'placeholder={UI_MESSAGES.SERVICE.NOTE_PLACEHOLDER}',
  'placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."': 'placeholder={UI_MESSAGES.REVIEW.COMMENT_PLACEHOLDER}',

  // Button text in JSX
  '{isSubmitting ? \'Đang gửi...\' : \'Gửi đánh giá\'}': '{isSubmitting ? UI_MESSAGES.REVIEW.SUBMITTING_BUTTON : UI_MESSAGES.REVIEW.SUBMIT_BUTTON}'
};

/**
 * Process a single file and replace Vietnamese content
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Add imports if file contains React and we're making UI changes
    const hasReactImport = content.includes('import React');
    const needsMessageImport = Object.values(VIETNAMESE_TO_ENGLISH).some(english => 
      english.includes('UI_MESSAGES') || english.includes('ERROR_TEMPLATES')
    );

    // Replace JavaScript string messages
    Object.entries(VIETNAMESE_TO_ENGLISH).forEach(([vietnamese, english]) => {
      if (content.includes(vietnamese)) {
        content = content.replace(new RegExp(vietnamese.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), english);
        hasChanges = true;
        console.log(`✅ JS Replaced in ${path.basename(filePath)}: "${vietnamese}" → "${english}"`);
      }
    });

    // Replace JSX elements
    Object.entries(JSX_REPLACEMENTS).forEach(([vietnamese, english]) => {
      if (content.includes(vietnamese)) {
        content = content.replace(vietnamese, english);
        hasChanges = true;
        console.log(`✅ JSX Replaced in ${path.basename(filePath)}: "${vietnamese}" → "${english}"`);
      }
    });

    // Add import statement if needed and not already present
    if (hasChanges && hasReactImport && needsMessageImport && !content.includes('from \'../utils/messages\'')) {
      const importRegex = /(import.*from.*['"][^'"]*api['"])/;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, '$1\\nimport { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from \'../utils/messages\'');
        console.log(`✅ Added imports to ${path.basename(filePath)}`);
      }
    }

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 Updated file: ${path.basename(filePath)}`);
    }

    return hasChanges;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively process all React files in a directory
 */
function processDirectory(dir, extensions = ['.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  let totalChanges = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== '.git') {
        totalChanges += processDirectory(filePath, extensions);
      } else if (stat.isFile() && extensions.includes(path.extname(file))) {
        if (processFile(filePath)) {
          totalChanges++;
        }
      }
    } catch (error) {
      console.error(`❌ Error accessing ${filePath}:`, error.message);
    }
  });

  return totalChanges;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Vietnamese to English translation for React App...');
  console.log('='.repeat(60));

  const webDir = path.join(__dirname, 'src');
  console.log(`📁 Processing directory: ${webDir}`);

  const changedFiles = processDirectory(webDir, ['.jsx', '.js']);

  console.log('='.repeat(60));
  console.log(`🎉 Translation completed!`);
  console.log(`📊 Files updated: ${changedFiles}`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('  1. Review updated components for syntax errors');
  console.log('  2. Test UI functionality');
  console.log('  3. Check import statements');
  console.log('  4. Verify message constants are imported correctly');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };