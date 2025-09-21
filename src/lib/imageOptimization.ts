// Image optimization utilities

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export class ImageOptimizer {
  /**
   * Resize and compress image file
   */
  static async optimizeImage(
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 800,
      maxHeight = 1200,
      quality = 0.85,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight, 
          maintainAspectRatio
        );

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file
            const optimizedFile = new File(
              [blob],
              this.generateOptimizedFileName(file.name, format),
              {
                type: `image/${format}`,
                lastModified: Date.now(),
              }
            );

            resolve(optimizedFile);
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    let width = Math.min(originalWidth, maxWidth);
    let height = Math.min(originalHeight, maxHeight);

    // Adjust based on aspect ratio
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  /**
   * Generate optimized filename
   */
  private static generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}_optimized.${format}`;
  }

  /**
   * Get image info without loading full image
   */
  static getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          size: file.size,
          type: file.type,
        });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate image for Buddhist content covers
   */
  static validateCoverImage(file: File): Promise<{
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    return new Promise(async (resolve) => {
      try {
        const info = await this.getImageInfo(file);
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Check file size
        if (info.size > 5 * 1024 * 1024) { // 5MB
          warnings.push('File size lớn hơn 5MB, có thể tải chậm');
        }

        // Check dimensions
        if (info.width < 300 || info.height < 400) {
          warnings.push('Kích thước ảnh nhỏ, có thể bị mờ khi hiển thị');
        }

        // Check aspect ratio
        const idealRatio = 2/3; // 400x600
        const tolerance = 0.1;
        
        if (Math.abs(info.aspectRatio - idealRatio) > tolerance) {
          recommendations.push(`Tỷ lệ khuyến nghị: 2:3 (400x600px). Hiện tại: ${info.aspectRatio.toFixed(2)}`);
        }

        // Check format
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(info.type)) {
          warnings.push('Định dạng không tối ưu. Khuyến nghị: JPG, PNG, WebP');
        }

        // Recommendations for Buddhist content
        if (info.width > 1000) {
          recommendations.push('Có thể resize xuống 800px để tối ưu tải trang');
        }

        resolve({
          isValid: warnings.length === 0,
          warnings,
          recommendations,
        });
      } catch {
        resolve({
          isValid: false,
          warnings: ['Không thể đọc thông tin ảnh'],
          recommendations: ['Kiểm tra lại file ảnh'],
        });
      }
    });
  }

  /**
   * Preset optimizations for different use cases
   */
  static presets = {
    // Cover images for products
    cover: {
      maxWidth: 600,
      maxHeight: 900,
      quality: 0.85,
      format: 'jpeg' as const,
      maintainAspectRatio: true,
    },
    
    // Thumbnails for lists
    thumbnail: {
      maxWidth: 200,
      maxHeight: 300,
      quality: 0.8,
      format: 'webp' as const,
      maintainAspectRatio: true,
    },
    
    // High quality for detailed view
    highQuality: {
      maxWidth: 1200,
      maxHeight: 1800,
      quality: 0.9,
      format: 'jpeg' as const,
      maintainAspectRatio: true,
    },
  };
}

// Helper function for components
export async function optimizeImageForUpload(file: File): Promise<File> {
  // For Buddhist covers, use cover preset
  return ImageOptimizer.optimizeImage(file, ImageOptimizer.presets.cover);
}

// Validate and get recommendations
export async function validateImageForCover(file: File) {
  return ImageOptimizer.validateCoverImage(file);
}
