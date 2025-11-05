/**
 * Script để chuẩn hóa tất cả messages sang tiếng Việt
 * 
 * Chạy: node scripts/standardize-messages.js
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = {
  // User messages
  "'Name is required'": "MSG.USER.NAME_REQUIRED",
  '"Name is required"': "MSG.USER.NAME_REQUIRED",
  "'Phone is required'": "MSG.USER.PHONE_REQUIRED",
  '"Phone is required"': "MSG.USER.PHONE_REQUIRED",
  "'Password must be at least 8 characters'": "MSG.USER.PASSWORD_MIN_LENGTH",
  '"Password must be at least 8 characters"': "MSG.USER.PASSWORD_MIN_LENGTH",
  "'Password must be at least 6 characters'": "MSG.USER.PASSWORD_MIN_LENGTH_6",
  '"Password must be at least 6 characters"': "MSG.USER.PASSWORD_MIN_LENGTH_6",
  "'User not found'": "MSG.USER.USER_NOT_FOUND",
  '"User not found"': "MSG.USER.USER_NOT_FOUND",
  "'Wrong password'": "MSG.USER.WRONG_PASSWORD",
  '"Wrong password"': "MSG.USER.WRONG_PASSWORD",
  "'Register success'": "MSG.USER.REGISTER_SUCCESS",
  '"Register success"': "MSG.USER.REGISTER_SUCCESS",
  "'Registration failed'": "MSG.USER.REGISTER_FAILED",
  '"Registration failed"': "MSG.USER.REGISTER_FAILED",
  "'Not allowed'": "MSG.USER.NOT_ALLOWED",
  '"Not allowed"': "MSG.USER.NOT_ALLOWED",
  "'Invalid status'": "MSG.USER.INVALID_STATUS",
  '"Invalid status"': "MSG.USER.INVALID_STATUS",
  "'Updated'": "MSG.COMMON.UPDATED",
  '"Updated"': "MSG.COMMON.UPDATED",
  "'Unauthorized'": "MSG.USER.UNAUTHORIZED",
  '"Unauthorized"': "MSG.USER.UNAUTHORIZED",
  "'Access denied. Admin role required.'": "MSG.USER.ADMIN_ONLY",
  '"Access denied. Admin role required."': "MSG.USER.ADMIN_ONLY",
  "'Current password incorrect'": "MSG.USER.CURRENT_PASSWORD_INCORRECT",
  '"Current password incorrect"': "MSG.USER.CURRENT_PASSWORD_INCORRECT",
  "'Worker/Driver not found'": "MSG.USER.WORKER_NOT_FOUND",
  '"Worker/Driver not found"': "MSG.USER.WORKER_NOT_FOUND",
  "'Worker deleted successfully'": "MSG.USER.WORKER_DELETED",
  '"Worker deleted successfully"': "MSG.USER.WORKER_DELETED",
  "'Access denied to admin users'": "MSG.USER.ACCESS_DENIED",
  '"Access denied to admin users"': "MSG.USER.ACCESS_DENIED",

  // Booking messages
  "'Address is required'": "MSG.BOOKING.ADDRESS_REQUIRED",
  '"Address is required"': "MSG.BOOKING.ADDRESS_REQUIRED",
  "'Service not found'": "MSG.BOOKING.SERVICE_NOT_FOUND",
  '"Service not found"': "MSG.BOOKING.SERVICE_NOT_FOUND",
  "'Customer not found'": "MSG.BOOKING.CUSTOMER_NOT_FOUND",
  '"Customer not found"': "MSG.BOOKING.CUSTOMER_NOT_FOUND",
  "'Booking not found'": "MSG.BOOKING.BOOKING_NOT_FOUND",
  '"Booking not found"': "MSG.BOOKING.BOOKING_NOT_FOUND",
  "'Invalid status value'": "MSG.BOOKING.INVALID_STATUS",
  '"Invalid status value"': "MSG.BOOKING.INVALID_STATUS",
  "'Cannot complete booking that is not confirmed'": "MSG.BOOKING.CANNOT_COMPLETE_NOT_CONFIRMED",
  '"Cannot complete booking that is not confirmed"': "MSG.BOOKING.CANNOT_COMPLETE_NOT_CONFIRMED",
  "'workerId required'": "MSG.SCHEDULE.WORKER_ID_REQUIRED",
  '"workerId required"': "MSG.SCHEDULE.WORKER_ID_REQUIRED",
  "'Booking not found or not authorized'": "MSG.BOOKING.BOOKING_NOT_FOUND",
  '"Booking not found or not authorized"': "MSG.BOOKING.BOOKING_NOT_FOUND",
  "'You can only cancel your own bookings'": "MSG.BOOKING.ONLY_CANCEL_OWN_BOOKING",
  '"You can only cancel your own bookings"': "MSG.BOOKING.ONLY_CANCEL_OWN_BOOKING",

  // Service messages
  "'Not found'": "MSG.SERVICE.SERVICE_NOT_FOUND",
  '"Not found"': "MSG.SERVICE.SERVICE_NOT_FOUND",
  "'Deleted'": "MSG.SERVICE.SERVICE_DELETED",
  '"Deleted"': "MSG.SERVICE.SERVICE_DELETED",
  "'Authentication required'": "MSG.SERVICE.AUTHENTICATION_REQUIRED",
  '"Authentication required"': "MSG.SERVICE.AUTHENTICATION_REQUIRED",

  // Banner messages
  "'Banner image is required'": "MSG.BANNER.IMAGE_REQUIRED",
  '"Banner image is required"': "MSG.BANNER.IMAGE_REQUIRED",
  "'Banner not found'": "MSG.BANNER.BANNER_NOT_FOUND",
  '"Banner not found"': "MSG.BANNER.BANNER_NOT_FOUND",
  "'Banner deleted successfully'": "MSG.BANNER.BANNER_DELETED",
  '"Banner deleted successfully"': "MSG.BANNER.BANNER_DELETED",
  "'View count incremented'": "MSG.BANNER.VIEW_COUNT_UPDATED",
  '"View count incremented"': "MSG.BANNER.VIEW_COUNT_UPDATED",
  "'Click count incremented'": "MSG.BANNER.CLICK_COUNT_UPDATED",
  '"Click count incremented"': "MSG.BANNER.CLICK_COUNT_UPDATED",
};

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Check if file already imports MSG
  const hasMsgImport = content.includes("require('../constants/messages')") || 
                       content.includes('require("../constants/messages")');

  // Add import if not exists
  if (!hasMsgImport && Object.keys(REPLACEMENTS).some(key => content.includes(key))) {
    // Find the last require statement
    const requireMatches = content.match(/const .+ = require\([^)]+\);/g);
    if (requireMatches && requireMatches.length > 0) {
      const lastRequire = requireMatches[requireMatches.length - 1];
      const insertPosition = content.indexOf(lastRequire) + lastRequire.length;
      content = content.slice(0, insertPosition) + 
                "\nconst MSG = require('../constants/messages');" +
                content.slice(insertPosition);
      hasChanges = true;
      console.log('  ✅ Added MSG import');
    }
  }

  // Replace messages
  let replaceCount = 0;
  for (const [oldMsg, newMsg] of Object.entries(REPLACEMENTS)) {
    if (content.includes(oldMsg)) {
      const regex = new RegExp(oldMsg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, newMsg);
      replaceCount++;
      hasChanges = true;
    }
  }

  if (replaceCount > 0) {
    console.log(`  ✅ Replaced ${replaceCount} messages`);
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 Saved changes to ${filePath}`);
    return replaceCount;
  } else {
    console.log(`  ⏭️  No changes needed`);
    return 0;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalReplaced = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      continue; // Skip subdirectories
    }

    if (file.endsWith('.js') && !file.includes('.test.')) {
      totalReplaced += processFile(filePath);
    }
  }

  return totalReplaced;
}

// Main execution
console.log('🚀 Starting message standardization...\n');

const controllersPath = path.join(__dirname, '../controllers');
const totalReplaced = processDirectory(controllersPath);

console.log('\n✅ Done!');
console.log(`📊 Total messages replaced: ${totalReplaced}`);
console.log('\n⚠️  Note: Please review the changes and test thoroughly!');
console.log('💡 Tip: Run "git diff" to see all changes');
