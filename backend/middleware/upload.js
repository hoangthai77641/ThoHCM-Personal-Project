const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../storage');
const servicesDir = path.join(uploadsDir, 'services');
const bannersDir = path.join(uploadsDir, 'banners');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Configure storage for services
const serviceStorage = multer.diskStorage({
  /**

   * TODO: Add function description

   */

  destination: function (req, file, cb) {
    cb(null, servicesDir);
  },
  /**

   * TODO: Add function description

   */

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

const allowedVideoTypes = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/webm'
];

// File filter for services with strict MIME type checking
const serviceFileFilter = (req, file, cb) => {
  // Check file extension matches MIME type (prevent MIME type spoofing)
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'images') {
    if (allowedImageTypes.includes(file.mimetype) && 
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  } else if (file.fieldname === 'videos') {
    if (allowedVideoTypes.includes(file.mimetype) && 
        ['.mp4', '.mpeg', '.mov', '.webm'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, MPEG, MOV, and WebM videos are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer for services with security limits
const serviceUpload = multer({
  storage: serviceStorage,
  fileFilter: serviceFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Tăng lên 15MB để handle file lớn
    files: 8, // Maximum 8 files total
    fieldSize: 2 * 1024 * 1024, // Tăng lên 2MB cho text fields
    fieldNameSize: 100, // 100 bytes field name limit
    fields: 20 // Tăng số fields cho JSON data
  }
});

// Configure storage for banners
const bannerStorage = multer.diskStorage({
  /**

   * TODO: Add function description

   */

  destination: function (req, file, cb) {
    cb(null, bannersDir);
  },
  /**

   * TODO: Add function description

   */

  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for banners (only images)
const bannerFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'image') {
    if (allowedImageTypes.includes(file.mimetype) && 
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed for banners'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer for banners
const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter: bannerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for banners
    files: 1, // Only 1 banner image
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // 100 bytes field name limit
    fields: 10 // Maximum 10 fields
  }
});

// Error handling wrapper for service uploads
const handleServiceUpload = (req, res, next) => {
  const upload = serviceUpload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 3 }
  ]);
  
  upload(req, res, (error) => {
    if (error) {
      console.error('❌ Upload error:', error.message);
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: 'File too large', 
          message: 'File size must be less than 15MB',
          maxSize: '15MB'
        });
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({ 
          error: 'Too many files', 
          message: 'Maximum 8 files allowed total (5 images + 3 videos)'
        });
      }
      
      if (error.code === 'LIMIT_FIELD_VALUE') {
        return res.status(413).json({ 
          error: 'Field value too large', 
          message: 'Text field size must be less than 2MB'
        });
      }
      
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          error: 'Unexpected file field', 
          message: 'Only images and videos fields are allowed'
        });
      }
      
      return res.status(400).json({ 
        error: 'Upload error', 
        message: error.message 
      });
    }
    
    // Log successful upload info
    if (req.files) {
      console.log('📁 Files uploaded successfully:', {
        images: req.files.images?.length || 0,
        videos: req.files.videos?.length || 0,
        totalSize: Object.values(req.files).flat().reduce((sum, file) => sum + (file.size || 0), 0)
      });
    }
    
    next();
  });
};

// Keep the old export for backward compatibility
const uploadServiceMedia = handleServiceUpload;

// Middleware for handling banner uploads
const uploadBanner = bannerUpload.single('image');

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  /**

   * TODO: Add function description

   */

  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  /**

   * TODO: Add function description

   */

  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for avatars (only images)
const avatarFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype) && 
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed for avatars'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer for avatars
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

// Middleware for handling avatar uploads
const uploadAvatar = avatarUpload.single('avatar');

module.exports = {
  uploadServiceMedia,
  uploadBanner,
  uploadAvatar
};