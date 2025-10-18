/**
 * Automatic script to translate Vietnamese comments to English in Web Frontend
 * Usage: node translateWebComments.js
 */

const fs = require('fs');
const path = require('path');

// Vietnamese to English comment translations for React/JSX
const translations = {
  // Common phrases
  '// Chỉ chạy một lần khi component mount': '// Run only once when component mounts',
  '// Nếu lỗi 401': '// If error 401',
  'không gọi lại API': 'do not call API again',
  'để tránh infinite loop': 'to avoid infinite loop',
  
  // JSX comments
  '{/* Dịch vụ nổi bật */}': '{/* Featured Services */}',
  '{/* Banner Slider - chỉ hiển thị khi không tìm kiếm */}': '{/* Banner Slider - only show when not searching */}',
  '/* Nút Thêm Banner */': '/* Add Banner Button */}',
  '{/* Khung giờ sáng */}': '{/* Morning time slots */}',
  '{/* Khung giờ chiều */}': '{/* Afternoon time slots */}',
  '{/* Khung giờ tối */}': '{/* Evening time slots */}',
  
  // Data handling
  '// Xử lý response data': '// Handle response data',
  '// Khung giờ mặc định': '// Default time slots',
  '// Khung giờ cố định': '// Fixed time slots',
  'từ 8:00 sáng đến 8:00 tối': 'from 8:00 AM to 8:00 PM',
  'cách nhau 1 tiếng': '1 hour apart',
  
  // Worker/Schedule
  '// Chỉ lấy lịch': '// Only get schedule',
  'của thợ trong service được chọn': 'of worker in selected service',
  '// Đặt thợ làm': '// Set worker as',
  'selected worker luôn': 'selected worker immediately',
  'Chỉ có 1 thợ': 'Only 1 worker',
  '// Tìm slot tương ứng': '// Find corresponding slot',
  'trong database': 'in database',
  
  // Booking/Status updates
  '// Cập nhật trạng thái booking': '// Update booking status',
  'thành confirmed': 'to confirmed',
  'với thời gian dự kiến': 'with estimated time',
  'thành done': 'to done',
  '// Hoàn thành công việc': '// Complete work',
  'trong schedule': 'in schedule',
  
  // General
  'Chỉ chạy': 'Run only',
  'một lần': 'once',
  'khi component': 'when component',
  'Nếu lỗi': 'If error',
  'Xử lý': 'Handle',
  'mặc định': 'default',
  'cố định': 'fixed',
  'được chọn': 'selected',
  'tương ứng': 'corresponding',
  'Cập nhật': 'Update',
  'Hoàn thành': 'Complete',
};

function translateComment(line) {
  let translatedLine = line;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedTranslations = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  
  for (const [vi, en] of sortedTranslations) {
    if (translatedLine.includes(vi)) {
      translatedLine = translatedLine.replace(new RegExp(vi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), en);
    }
  }
  
  return translatedLine;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  const translatedLines = lines.map(line => {
    const trimmed = line.trim();
    // Check for comments: //, /*, {/*
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.includes('//') || trimmed.includes('{/*')) {
      const translated = translateComment(line);
      if (translated !== line) {
        modified = true;
        return translated;
      }
    }
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, translatedLines.join('\n'), 'utf8');
    console.log(`✓ Translated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir, extensions = ['.js', '.jsx']) {
  let filesProcessed = 0;
  let filesModified = 0;
  
  function walk(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist, build
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          walk(fullPath);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        filesProcessed++;
        if (processFile(fullPath)) {
          filesModified++;
        }
      }
    }
  }
  
  walk(dir);
  return { filesProcessed, filesModified };
}

// Main execution
const targetDir = path.join(__dirname, 'src');
console.log('Starting web comment translation...');
console.log('Target directory:', targetDir);
console.log('');

const result = processDirectory(targetDir, ['.js', '.jsx', '.css']);

console.log('');
console.log('='.repeat(50));
console.log(`Files processed: ${result.filesProcessed}`);
console.log(`Files modified: ${result.filesModified}`);
console.log('='.repeat(50));

if (result.filesModified > 0) {
  console.log('\n✓ Translation completed successfully!');
  console.log('Please review the changes and test your application.');
} else {
  console.log('\n✓ No comments needed translation.');
}
