const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists - with better error handling for Cloud Run
const uploadsDir = path.join(__dirname, '../storage');
const avatarsDir = path.join(uploadsDir, 'avatars');

function ensureDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Failed to create directory ${dir}:`, error);
    // Create a fallback temp directory
    const tempDir = '/tmp/avatars';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(`Created temp directory: ${tempDir}`);
    }
    return tempDir;
  }
  return dir;
}

const finalAvatarsDir = ensureDirectory(avatarsDir);

// Configure storage for avatars with Cloud Run compatibility
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use temp directory in Cloud Run if needed
    const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/avatars' : finalAvatarsDir;
    
    // Ensure directory exists at runtime
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create upload directory:', error);
        return cb(error);
      }
    }
    
    console.log('Using upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Allowed MIME types
const allowedImageTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// File filter for avatars (only images)
const avatarFileFilter = (req, file, cb) => {
  console.log('File filter check:', {
    fieldname: file.fieldname,
    mimetype: file.mimetype,
    originalname: file.originalname
  });

  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype) && 
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed for avatars'), false);
    }
  } else {
    cb(new Error('Unexpected field name. Expected "avatar"'), false);
  }
};

// Configure multer for avatars with better error handling
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
    files: 1, // Only 1 avatar image
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // 100 bytes field name limit
    fields: 10 // Maximum 10 fields
  }
});

// Middleware for handling avatar uploads with enhanced error handling
const uploadAvatar = (req, res, next) => {
  console.log('Upload avatar middleware called');
  
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected field. Use "avatar" as field name.' });
      } else {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    console.log('Upload successful:', req.file);
    next();
  });
};

module.exports = {
  uploadAvatar
};