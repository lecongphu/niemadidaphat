import express from 'express';

const router = express.Router();

// GET /api/auth/callback - OAuth callback (fallback)
router.get('/callback', async (req, res) => {
  // Redirect về frontend với thông báo sử dụng Google One-Tap
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  console.log('OAuth callback được gọi - khuyến khích sử dụng Google One-Tap thay thế');
  res.redirect(`${clientUrl}/?info=use_one_tap`);
});

export default router;
