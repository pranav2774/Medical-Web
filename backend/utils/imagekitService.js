const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

/**
 * Upload a receipt file to ImageKit
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in ImageKit (e.g., 'expenses/receipts')
 * @returns {Promise<{success: boolean, url?: string, fileId?: string, error?: string}>}
 */
async function uploadReceipt(fileBuffer, fileName, folder = 'expenses/receipts') {
  try {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error('ImageKit credentials not configured');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folder,
    });

    return {
      success: true,
      url: response.url,
      fileId: response.fileId,
      name: uniqueFileName,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
}

/**
 * Delete a receipt file from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteReceipt(fileId) {
  try {
    if (!fileId) {
      return { success: true }; // No file to delete
    }

    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error('ImageKit private key not configured');
    }

    await imagekit.deleteFile(fileId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
}

/**
 * Generate authentication parameters for client-side upload
 * Used for frontend direct upload to ImageKit
 * @returns {object} Auth parameters for ImageKit client
 */
function getAuthenticationParameters() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
      throw new Error('ImageKit credentials not configured');
    }

    return imagekit.getAuthenticationParameters();
  } catch (error) {
    console.error('Get auth parameters error:', error);
    return null;
  }
}

module.exports = {
  uploadReceipt,
  deleteReceipt,
  getAuthenticationParameters,
  imagekit,
};
