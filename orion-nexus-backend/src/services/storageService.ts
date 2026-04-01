import { v2 as cloudinary } from 'cloudinary';
import { FileUpload } from '../types/api';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

// Define interfaces for Cloudinary upload options
interface ImageUploadOptions {
  resource_type: 'image';
  quality: string;
  fetch_format: string;
  folder?: string;
}

interface FileUploadOptions {
  resource_type: 'raw';
  use_filename: boolean;
  unique_filename: boolean;
  folder?: string;
}

interface SignatureParams {
  [key: string]: string | number | boolean;
}

class StorageService {
  private isCloudinaryConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  async uploadImage(file: FileUpload, folder?: string): Promise<UploadResult> {
    try {
      if (!this.isCloudinaryConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      // Convert buffer to base64
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const uploadOptions: ImageUploadOptions = {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      const result = await cloudinary.uploader.upload(base64String, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadFile(file: FileUpload, folder?: string): Promise<UploadResult> {
    try {
      if (!this.isCloudinaryConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      // Convert buffer to base64
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const uploadOptions: FileUploadOptions = {
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      const result = await cloudinary.uploader.upload(base64String, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      if (!this.isCloudinaryConfigured()) {
        console.warn('Cloudinary not configured, skipping file deletion');
        return;
      }

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('File deletion error:', error);
      // Don't throw error, just log it
    }
  }

  async getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}): Promise<string> {
    if (!this.isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    const { width, height, quality = 'auto', format = 'auto' } = options;

    return cloudinary.url(publicId, {
      width,
      height,
      quality,
      format,
      fetch_format: 'auto',
    });
  }

  generateUploadSignature(params: SignatureParams): {
    signature: string;
    timestamp: number;
  } {
    if (!this.isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { ...params, timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return { signature, timestamp };
  }
}

export const storageService = new StorageService();