// Cloudflare R2 Storage Service
// Handles file upload, download, and deletion operations using R2 (S3-compatible API)

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string; // Custom domain for public access
}

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  error?: string;
}

class R2StorageService {
  private config: R2StorageConfig;
  private s3Client: S3Client | null = null;

  constructor() {
    this.config = {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.R2_BUCKET_NAME || '',
      publicDomain: process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN,
    };

    // Kiểm tra credentials
    if (!this.isConfigured()) {
      console.warn('⚠️ R2 credentials not properly configured. Please check your environment variables.');
      return;
    }

    // Khởi tạo S3 client cho R2
    this.s3Client = new S3Client({
      region: 'auto', // R2 sử dụng 'auto' region
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      // Thêm SSL configuration để tránh handshake issues
      requestHandler: {
        httpsAgent: {
          rejectUnauthorized: true,
          secureProtocol: 'TLSv1_2_method',
        }
      }
    });
  }

  /**
   * Upload file to Cloudflare R2
   */
  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    mimeType?: string
  ): Promise<UploadResponse> {
    try {
      if (!this.isConfigured()) {
        throw new Error('R2 credentials not properly configured. Please check your environment variables.');
      }

      // Kiểm tra credentials có phải placeholder không
      if (this.config.accountId.includes('your-') || 
          this.config.accessKeyId.includes('your-') || 
          this.config.secretAccessKey.includes('your-')) {
        throw new Error('R2 credentials are still using placeholder values. Please update your .env.local file with real credentials.');
      }

      if (!this.s3Client) {
        throw new Error('R2 client not initialized');
      }

      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
        // Đặt file có thể truy cập công khai
        ACL: undefined, // R2 không sử dụng ACL như S3 truyền thống
      });

      await this.s3Client.send(command);

      // Tạo public URL
      const publicUrl = this.getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete file from Cloudflare R2
   */
  async deleteFile(filePath: string): Promise<DeleteResponse> {
    try {
      if (!this.config.accountId || !this.config.accessKeyId || !this.config.secretAccessKey || !this.config.bucketName) {
        throw new Error('R2 credentials not configured');
      }

      if (!this.s3Client) {
        throw new Error('R2 client not initialized');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: filePath,
      });

      await this.s3Client.send(command);

      return { success: true };
    } catch (error) {
      console.error('R2 delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    // Nếu có custom domain, sử dụng nó
    if (this.config.publicDomain) {
      return `${this.config.publicDomain}/${filePath.replace(/^\//, '')}`;
    }
    
    // Sử dụng R2.dev public URL (cần enable public access trong R2 dashboard)
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${filePath.replace(/^\//, '')}`;
  }

  /**
   * Extract file path from public URL
   */
  extractFilePath(publicUrl: string): string | null {
    let baseUrl = '';
    
    if (this.config.publicDomain) {
      baseUrl = this.config.publicDomain;
    } else {
      baseUrl = `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com`;
    }
    
    if (publicUrl.startsWith(baseUrl)) {
      return publicUrl.replace(baseUrl, '').replace(/^\//, '');
    }
    return null;
  }

  /**
   * Check if URL is an R2 URL
   */
  isR2Url(url: string): boolean {
    if (this.config.publicDomain && url.startsWith(this.config.publicDomain)) {
      return true;
    }
    
    const r2BaseUrl = `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com`;
    return url.startsWith(r2BaseUrl);
  }

  /**
   * Upload file from FormData
   */
  async uploadFromFormData(
    formData: FormData,
    filePath: string
  ): Promise<UploadResponse> {
    try {
      const file = formData.get('file') as File;
      if (!file) {
        throw new Error('No file provided');
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      return await this.uploadFile(filePath, buffer, mimeType);
    } catch (error) {
      console.error('R2 form upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: string = ''): Promise<Array<{
    key: string;
    url: string;
    size: number;
    lastModified: Date;
  }>> {
    try {
      if (!this.config.accountId || !this.config.accessKeyId || !this.config.secretAccessKey || !this.config.bucketName) {
        throw new Error('R2 credentials not configured');
      }

      if (!this.s3Client) {
        throw new Error('R2 client not initialized');
      }

      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: directory ? `${directory}` : '',
      });

      const response = await this.s3Client.send(command);
      
      return response.Contents?.map(obj => ({
        key: obj.Key || '',
        url: this.getPublicUrl(obj.Key || ''),
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date()
      })) || [];
    } catch (error) {
      console.error('R2 list files error:', error);
      return [];
    }
  }

  /**
   * Check if R2 is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.accountId &&
      this.config.accessKeyId &&
      this.config.secretAccessKey &&
      this.config.bucketName
    );
  }
}

// Export singleton instance
export const r2Storage = new R2StorageService();

// Export class for testing
export { R2StorageService };

// Helper functions để tương thích với bunnyStorage API
export function getR2PublicUrl(filePath: string): string {
  return r2Storage.getPublicUrl(filePath);
}

export function extractR2FilePath(publicUrl: string): string | null {
  return r2Storage.extractFilePath(publicUrl);
}

export function isR2Url(url: string): boolean {
  return r2Storage.isR2Url(url);
}

// Backward compatibility aliases (để dễ migrate từ bunnyStorage)
export const getBunnyPublicUrl = getR2PublicUrl;
export const extractBunnyFilePath = extractR2FilePath;
export const isBunnyUrl = isR2Url;

// Export chính để thay thế bunnyStorage
export const bunnyStorage = r2Storage;
