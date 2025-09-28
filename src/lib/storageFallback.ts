// Storage Fallback Service
// Sử dụng Bunny CDN làm fallback nếu R2 không hoạt động

import { r2Storage } from './r2Storage';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  storageUsed?: 'r2' | 'bunny';
}

interface DeleteResponse {
  success: boolean;
  error?: string;
  storageUsed?: 'r2' | 'bunny';
}

class StorageFallbackService {
  private useR2: boolean = true;

  constructor() {
    // Kiểm tra R2 configuration
    this.checkR2Configuration();
  }

  private checkR2Configuration() {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    const bucketName = process.env.R2_BUCKET_NAME || '';

    // Nếu credentials là placeholder hoặc không đầy đủ, sử dụng Bunny
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName ||
        accountId.includes('your-') || 
        accessKeyId.includes('your-') || 
        secretAccessKey.includes('your-')) {
      this.useR2 = false;
      console.log('🔄 R2 not configured, falling back to Bunny CDN');
    }
  }



}

// Export singleton instance
export const storageFallback = new StorageFallbackService();

// Export class for testing
export { StorageFallbackService };
