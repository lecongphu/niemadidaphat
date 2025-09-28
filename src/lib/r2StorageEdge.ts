// Cloudflare R2 Storage Service for Edge Runtime
// Uses fetch API instead of AWS SDK for Edge Runtime compatibility

interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string;
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

class R2StorageEdgeService {
  private config: R2StorageConfig;

  constructor() {
    this.config = {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.R2_BUCKET_NAME || '',
      publicDomain: process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN,
    };
  }

  private isConfigured(): boolean {
    return !!(this.config.accountId && this.config.accessKeyId && this.config.secretAccessKey && this.config.bucketName);
  }

  private getPublicUrl(key: string): string {
    if (this.config.publicDomain) {
      return `https://${this.config.publicDomain}/${key}`;
    }
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  private async createPresignedUrl(method: 'PUT' | 'DELETE', key: string, contentType?: string): Promise<string> {
    // For Edge Runtime, we'll use a simpler approach
    // In production, you might want to implement proper AWS signature v4
    const endpoint = `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${key}`;
    
    // For now, return the direct endpoint
    // In a real implementation, you'd need to generate proper presigned URLs
    return endpoint;
  }

  async uploadFile(filePath: string, fileBuffer: Buffer, mimeType?: string): Promise<UploadResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: 'R2 credentials not configured' };
      }

      // Convert Buffer to Uint8Array for Edge Runtime
      const uint8Array = new Uint8Array(fileBuffer);
      
      const url = await this.createPresignedUrl('PUT', filePath, mimeType);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: uint8Array,
        headers: {
          'Content-Type': mimeType || 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      return {
        success: true,
        url: this.getPublicUrl(filePath),
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteFile(filePath: string): Promise<DeleteResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: 'R2 credentials not configured' };
      }

      const url = await this.createPresignedUrl('DELETE', filePath);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('R2 delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async listFiles(prefix: string = ''): Promise<Array<{
    key: string;
    url: string;
    size: number;
    lastModified: Date;
  }>> {
    try {
      if (!this.isConfigured()) {
        return [];
      }

      // For Edge Runtime, we'll return an empty array for now
      // In a real implementation, you'd need to implement S3 ListObjects API using fetch
      console.warn('List files not implemented for Edge Runtime');
      return [];
    } catch (error) {
      console.error('R2 list files error:', error);
      return [];
    }
  }
}

export const r2StorageEdge = new R2StorageEdgeService();
