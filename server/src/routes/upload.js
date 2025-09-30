import express from 'express';
import multer from 'multer';
import { uploadToR2 } from '../config/r2Storage.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// POST /api/upload/r2 - Upload file to R2
router.post('/r2', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folder, slug } = req.body;
    const file = req.file;

    // Generate file path
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanFileName}`;
    
    let filePath = fileName;
    if (folder && slug) {
      filePath = `${folder}/${slug}/${fileName}`;
    } else if (folder) {
      filePath = `${folder}/${fileName}`;
    } else if (slug) {
      filePath = `${slug}/${fileName}`;
    }

    // Upload to R2
    const result = await uploadToR2(filePath, file.buffer, file.mimetype);

    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to upload file to R2', 
        details: result.error 
      });
    }

    return res.json({
      success: true,
      url: result.url,
      filePath: filePath,
      storageUsed: 'r2',
    });

  } catch (error) {
    console.error('R2 upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

export default router;
