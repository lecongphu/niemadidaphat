import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToR2 = async (filePath, buffer, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${filePath}`;
    
    return {
      success: true,
      url: publicUrl,
      filePath: filePath
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { r2Client };
