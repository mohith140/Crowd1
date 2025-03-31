const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

// Check if GCP environment is properly configured
const isGcpConfigured = process.env.GCP_PROJECT_ID && process.env.GCP_BUCKET_NAME;
const keyFilePath = path.join(__dirname, '../config/gcp-keyfile.json');
const keyFileExists = fs.existsSync(keyFilePath);

// Configuration for Google Cloud Storage
// In production, use environment variables or a keyfile
let storage;
let bucketName;

if (isGcpConfigured && keyFileExists) {
  storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID || 'fundify-project',
    keyFilename: process.env.GCP_KEY_FILE || keyFilePath
  });
  
  bucketName = process.env.GCP_BUCKET_NAME || 'fundify-content-bucket';
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload a file to Google Cloud Storage or local filesystem if GCP is not configured
 * @param {Object} file - The file object from multer
 * @param {string} destinationPath - The path within the bucket to store the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
async function uploadToCloudStorage(file, destinationPath) {
  try {
    // If GCP is not configured, store locally
    if (!isGcpConfigured || !keyFileExists) {
      return await storeFileLocally(file, destinationPath);
    }
    
    // Create the bucket if it doesn't exist
    const [bucketExists] = await storage.bucket(bucketName).exists();
    if (!bucketExists) {
      await storage.createBucket(bucketName);
      // Set bucket to public readable
      await storage.bucket(bucketName).makePublic();
    }

    // Create a unique filename to prevent collisions
    const fileExtension = path.extname(file.originalname);
    const fileName = `${destinationPath}/${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    
    // For files stored in memory (multer's buffer)
    if (file.buffer) {
      const fileBuffer = file.buffer;
      
      // Create a file in the bucket
      const blob = storage.bucket(bucketName).file(fileName);
      
      // Upload the file buffer
      await blob.save(fileBuffer, {
        contentType: file.mimetype,
        public: true,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname
          }
        }
      });
      
      // Get the public URL
      return `https://storage.googleapis.com/${bucketName}/${fileName}`;
    } 
    // For files saved to disk temporarily
    else {
      // Create a temporary path
      const tempFilePath = path.join(os.tmpdir(), file.originalname);
      
      // Write the file to the temp directory
      fs.writeFileSync(tempFilePath, fs.readFileSync(file.path));
      
      // Upload the file
      await storage.bucket(bucketName).upload(tempFilePath, {
        destination: fileName,
        public: true,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname
          }
        }
      });
      
      // Clean up the temp file
      fs.unlinkSync(tempFilePath);
      
      // Get the public URL
      return `https://storage.googleapis.com/${bucketName}/${fileName}`;
    }
  } catch (error) {
    console.error('Error uploading to cloud storage:', error);
    // Fallback to local storage in case of error
    return await storeFileLocally(file, destinationPath);
  }
}

/**
 * Store a file locally when cloud storage is not available
 * @param {Object} file - The file object from multer
 * @param {string} destinationPath - The path within the uploads directory
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
async function storeFileLocally(file, destinationPath) {
  try {
    // Create the directory structure
    const destDir = path.join(uploadsDir, destinationPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Create a unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    const filePath = path.join(destDir, uniqueFilename);
    
    // Write the file
    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else {
      fs.copyFileSync(file.path, filePath);
    }
    
    // Return a relative URL to the file
    const relativePath = path.join('/uploads', destinationPath, uniqueFilename).replace(/\\/g, '/');
    return relativePath;
  } catch (error) {
    console.error('Error storing file locally:', error);
    throw error;
  }
}

/**
 * Generate a signed URL with limited-time access for private content
 * @param {string} fileName - The file name in the bucket
 * @param {number} expirationTimeInMinutes - How long the URL should be valid
 * @returns {Promise<string>} - A signed URL with time-limited access
 */
async function generateSignedUrl(fileName, expirationTimeInMinutes = 15) {
  try {
    // If GCP is not configured, return a local URL
    if (!isGcpConfigured || !keyFileExists) {
      if (fileName.startsWith('/uploads')) {
        return fileName; // Return as is if it's already a local path
      }
      return path.join('/uploads', fileName).replace(/\\/g, '/');
    }
    
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationTimeInMinutes * 60 * 1000,
    };

    const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    // Fallback to returning the filename
    if (fileName.startsWith('/uploads')) {
      return fileName;
    }
    return path.join('/uploads', fileName).replace(/\\/g, '/');
  }
}

/**
 * Delete a file from cloud storage or local filesystem
 * @param {string} fileName - The full path to the file in the bucket or uploads directory
 * @returns {Promise<void>}
 */
async function deleteFromCloudStorage(fileName) {
  try {
    // If it's a local file (starts with /uploads)
    if (fileName.startsWith('/uploads')) {
      const localPath = path.join(__dirname, '..', fileName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Successfully deleted local file: ${localPath}`);
      }
      return;
    }
    
    // If GCP is not configured, assume it's a local file
    if (!isGcpConfigured || !keyFileExists) {
      return;
    }
    
    await storage.bucket(bucketName).file(fileName).delete();
    console.log(`Successfully deleted file from cloud storage: ${fileName}`);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

module.exports = {
  uploadToCloudStorage,
  generateSignedUrl,
  deleteFromCloudStorage
}; 