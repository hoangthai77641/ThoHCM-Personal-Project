const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'thohcm-storage';

// Check if bucket exists - don't create automatically in production
async function ensureBucket() {
  try {
    await storage.bucket(bucketName).getMetadata();
    console.log(`Bucket ${bucketName} exists and is accessible`);
    return true;
  } catch (error) {
    if (error.code === 404) {
      console.error(`Bucket ${bucketName} does not exist. Please create it manually.`);
      return false;
    } else {
      console.error('Bucket access error:', error);
      return false;
    }
  }
}

// Initialize bucket check
let bucketReady = false;
ensureBucket().then(ready => {
  bucketReady = ready;
  if (ready) {
    console.log('Google Cloud Storage is ready');
  } else {
    console.error('Google Cloud Storage setup failed');
  }
}).catch(error => {
  console.error('Bucket initialization error:', error);
  bucketReady = false;
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

// Memory storage for multer (temporary storage before uploading to GCS)
const memoryStorage = multer.memoryStorage();

// File filter for services
const serviceFileFilter = (req, file, cb) => {
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

// File filter for avatars
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

// File filter for banners
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

// Configure multer for services
const serviceUpload = multer({
  storage: memoryStorage,
  fileFilter: serviceFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    files: 8, // Maximum 8 files total
    fieldSize: 2 * 1024 * 1024, // 2MB for text fields
    fieldNameSize: 100,
    fields: 20 // More fields for JSON data
  }
});

// Configure multer for avatars
const avatarUpload = multer({
  storage: memoryStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
    files: 1,
    fieldSize: 1024 * 1024,
    fieldNameSize: 100,
    fields: 10
  }
});

// Configure multer for banners
const bannerUpload = multer({
  storage: memoryStorage,
  fileFilter: bannerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for banners
    files: 1,
    fieldSize: 1024 * 1024,
    fieldNameSize: 100,
    fields: 10
  }
});

// Upload to Google Cloud Storage
async function uploadToGCS(file, folder) {
  if (!bucketReady) {
    throw new Error('Google Cloud Storage is not ready. Please check bucket configuration.');
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const filename = `${folder}/${file.fieldname}-${uniqueSuffix}${extension}`;
  
  const bucket = storage.bucket(bucketName);
  const gcsFile = bucket.file(filename);
  
  const stream = gcsFile.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
    resumable: false,
  });
  
  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      console.error('GCS upload error:', error);
      reject(error);
    });
    
    stream.on('finish', async () => {
      try {
        // Make the file public
        await gcsFile.makePublic();
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        resolve({ filename, publicUrl });
      } catch (error) {
        console.error('Error making file public:', error);
        reject(error);
      }
    });
    
    stream.end(file.buffer);
  });
}

// Delete file from Google Cloud Storage
async function deleteFromGCS(filename) {
  try {
    await storage.bucket(bucketName).file(filename).delete();
    console.log(`Deleted file: ${filename}`);
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
  }
}

// Middleware to handle banner upload to GCS
const uploadBannerMiddleware = (req, res, next) => {
  bannerUpload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return next(); // No file uploaded, continue
    }
    
    try {
      // Upload to GCS
      const { publicUrl } = await uploadToGCS(req.file, 'banners');
      req.file.gcsUrl = publicUrl;
      req.file.cloudStoragePublicUrl = publicUrl;
      next();
    } catch (error) {
      console.error('GCS upload error:', error);
      return res.status(500).json({ message: 'Failed to upload image to cloud storage', error: error.message });
    }
  });
};

// Middleware to handle avatar upload to GCS
const uploadAvatarMiddleware = (req, res, next) => {
  avatarUpload.single('avatar')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return next(); // No file uploaded, continue
    }
    
    try {
      // Upload to GCS
      const { publicUrl } = await uploadToGCS(req.file, 'avatars');
      req.file.gcsUrl = publicUrl;
      req.file.cloudStoragePublicUrl = publicUrl;
      next();
    } catch (error) {
      console.error('GCS upload error:', error);
      return res.status(500).json({ message: 'Failed to upload avatar to cloud storage', error: error.message });
    }
  });
};

// Middleware to handle service media upload to GCS
const uploadServiceMediaMiddleware = (req, res, next) => {
  const upload = serviceUpload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 3 }
  ]);

  upload(req, res, async (err) => {
    if (err) {
      console.error(' Multer error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: 'File too large', 
          message: 'File size must be less than 50MB',
          maxSize: '50MB'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({ 
          error: 'Too many files', 
          message: 'Maximum 8 files allowed total (5 images + 3 videos)'
        });
      }
      
      return res.status(400).json({ 
        error: 'Upload error', 
        message: err.message 
      });
    }
    
    if (!req.files || ((!req.files.images || req.files.images.length === 0) && (!req.files.videos || req.files.videos.length === 0))) {
      return next(); // No files uploaded, continue
    }
    
    try {
      // Upload images to GCS
      if (req.files.images && req.files.images.length > 0) {
        const imageUrls = [];
        for (const file of req.files.images) {
          const { publicUrl } = await uploadToGCS(file, 'services');
          imageUrls.push(publicUrl);
        }
        // Store GCS URLs in req.files for controller to use
        req.files.images.forEach((file, index) => {
          file.gcsUrl = imageUrls[index];
          file.cloudStoragePublicUrl = imageUrls[index];
        });
        console.log(' Uploaded images to GCS:', imageUrls.length);
      }
      
      // Upload videos to GCS
      if (req.files.videos && req.files.videos.length > 0) {
        const videoUrls = [];
        for (const file of req.files.videos) {
          const { publicUrl } = await uploadToGCS(file, 'services');
          videoUrls.push(publicUrl);
        }
        // Store GCS URLs in req.files for controller to use
        req.files.videos.forEach((file, index) => {
          file.gcsUrl = videoUrls[index];
          file.cloudStoragePublicUrl = videoUrls[index];
        });
        console.log(' Uploaded videos to GCS:', videoUrls.length);
      }
      
      next();
    } catch (error) {
      console.error(' GCS upload error:', error);
      return res.status(500).json({ 
        message: 'Failed to upload files to cloud storage', 
        error: error.message 
      });
    }
  });
};

// Middleware wrappers
const uploadServiceMedia = uploadServiceMediaMiddleware;
const uploadBanner = uploadBannerMiddleware;
const uploadAvatar = uploadAvatarMiddleware;

module.exports = {
  uploadServiceMedia,
  uploadBanner,
  uploadAvatar,
  uploadToGCS,
  deleteFromGCS,
  bucketName
};