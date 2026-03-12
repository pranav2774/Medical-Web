const ImageKit = require('imagekit');

// ImageKit will be initialized dynamically per request
// to ensure process.env is fully loaded from dotenv

/**
 * Upload a prescription file to ImageKit
 * @param {string|Buffer} file - Base64 string or file buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in ImageKit (e.g., 'prescriptions')
 * @returns {Promise<{success: boolean, url?: string, fileId?: string, error?: string}>}
 */
async function uploadPrescription(file, fileName, folder = 'prescriptions') {
  try {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PUBLIC_KEY === 'your_public_key') {
      throw new Error('ImageKit credentials not properly configured in .env');
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: file,
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
    console.error('ImageKit upload error (Prescriptions):', error);
    return {
      success: false,
      error: error.message || 'Failed to upload prescription',
    };
  }
}

module.exports = {
  uploadPrescription,
};
