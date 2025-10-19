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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 8, // Maximum 8 files total
    fieldSize: 1024 * 1024,
    fieldNameSize: 100,
    fields: 10
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

// Middleware wrappers
const uploadServiceMedia = serviceUpload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]);

const uploadBanner = bannerUpload.single('image');
const uploadAvatar = avatarUpload.single('avatar');

module.exports = {
  uploadServiceMedia,
  uploadBanner,
  uploadAvatar,
  uploadToGCS,
  deleteFromGCS,
  bucketName
};