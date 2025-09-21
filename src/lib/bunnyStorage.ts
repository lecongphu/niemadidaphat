// Bunny CDN Storage Service
// Handles file upload, download, and deletion operations

interface BunnyStorageConfig {
  storageZoneName: string;
  accessKey: string;
  region?: string;
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

class BunnyStorageService {
  private config: BunnyStorageConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME || '',
      accessKey: process.env.BUNNY_ACCESS_KEY || '',
      region: process.env.BUNNY_REGION || 'ny' // Default to New York
    };

    this.baseUrl = `https://${this.config.region}.storage.bunnycdn.com/${this.config.storageZoneName}`;
  }

  /**
   * Upload file to Bunny CDN
   */
  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    mimeType?: string
  ): Promise<UploadResponse> {
    try {
      if (!this.config.storageZoneName || !this.config.accessKey) {
        throw new Error('Bunny CDN credentials not configured');
      }

      const url = `${this.baseUrl}/${filePath}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey,
          'Content-Type': mimeType || 'application/octet-stream',
        },
        body: fileBuffer as BodyInit,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      // Return the public CDN URL
      const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
      const publicUrl = cdnUrl ? `${cdnUrl}/${filePath}` : url;

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error('Bunny CDN upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete file from Bunny CDN
   */
  async deleteFile(filePath: string): Promise<DeleteResponse> {
    try {
      if (!this.config.storageZoneName || !this.config.accessKey) {
        throw new Error('Bunny CDN credentials not configured');
      }

      const url = `${this.baseUrl}/${filePath}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.config.accessKey,
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Bunny CDN delete error:', error);
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
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    if (!cdnUrl) {
      throw new Error('BUNNY_CDN_URL not configured');
    }
    return `${cdnUrl}/${filePath.replace(/^\//, '')}`;
  }

  /**
   * Extract file path from public URL
   */
  extractFilePath(publicUrl: string): string | null {
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    if (!cdnUrl) return null;
    
    if (publicUrl.startsWith(cdnUrl)) {
      return publicUrl.replace(cdnUrl, '').replace(/^\//, '');
    }
    return null;
  }

  /**
   * Check if URL is a Bunny CDN URL
   */
  isBunnyUrl(url: string): boolean {
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
    return cdnUrl ? url.startsWith(cdnUrl) : false;
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
      console.error('Bunny CDN form upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List files in a directory (optional feature)
   */
  async listFiles(directory: string = ''): Promise<string[]> {
    try {
      if (!this.config.storageZoneName || !this.config.accessKey) {
        throw new Error('Bunny CDN credentials not configured');
      }

      const url = `${this.baseUrl}/${directory}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'AccessKey': this.config.accessKey,
        },
      });

      if (!response.ok) {
        throw new Error(`List files failed: ${response.status}`);
      }

      const data = await response.json();
      return data.map((item: { ObjectName: string }) => item.ObjectName);
    } catch (error) {
      console.error('Bunny CDN list files error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const bunnyStorage = new BunnyStorageService();

// Export class for testing
export { BunnyStorageService };

// Helper functions
export function getBunnyPublicUrl(filePath: string): string {
  return bunnyStorage.getPublicUrl(filePath);
}

export function extractBunnyFilePath(publicUrl: string): string | null {
  return bunnyStorage.extractFilePath(publicUrl);
}

export function isBunnyUrl(url: string): boolean {
  return bunnyStorage.isBunnyUrl(url);
}
