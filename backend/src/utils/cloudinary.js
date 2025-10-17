import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a single image to Cloudinary
 * @param {string} localPath - Local file path
 * @param {string} folder - Cloudinary folder name (optional)
 * @returns {Object|null} - Cloudinary response or null
 */
export const uploadImage = async (localPath, folder = "products") => {
  try {
    if (!localPath) return null;

    const response = await cloudinary.uploader.upload(localPath, {
      folder: folder,
      resource_type: "auto",
    });

    // Delete local file after successful upload
    fs.unlinkSync(localPath);

    return {
      url: response.secure_url,
      publicId: response.public_id,
    };
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - Cloudinary folder name (optional)
 * @returns {Array} - Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files, folder = "products") => {
  try {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map((file) => uploadImage(file.path, folder));

    const results = await Promise.all(uploadPromises);
    console.log(
      "🚀 ~ cloudinary.js:58 ~ uploadMultipleImages ~ results:",
      results
    );

    // Filter out failed uploads (null values)
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("Multiple image upload error:", error);
    return [];
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object|null} - Cloudinary response or null
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Array} - Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return [];

    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));

    const results = await Promise.all(deletePromises);

    return results;
  } catch (error) {
    console.error("Multiple image deletion error:", error);
    return [];
  }
};

export default cloudinary;
