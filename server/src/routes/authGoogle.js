import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import { generateToken, authMiddleware, requireAuth } from '../middleware/jwtAuth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Google One-Tap Authentication
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Credential is required'
      });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let userResult = await query(
      'SELECT id, email, full_name, avatar_url, role, created_at FROM user_profiles WHERE email = $1',
      [email]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await query(
        `INSERT INTO user_profiles (email, full_name, avatar_url, role, google_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, full_name, avatar_url, role, created_at`,
        [email, name || '', picture || '', 'user', googleId]
      );
      user = insertResult.rows[0];

      // Add default user role
      await query(
        'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)',
        [user.id, 'user']
      );
    } else {
      user = userResult.rows[0];

      // Update user info from Google (avatar, name might have changed)
      await query(
        `UPDATE user_profiles 
         SET full_name = $1, avatar_url = $2, google_id = $3, updated_at = NOW()
         WHERE id = $4`,
        [name || user.full_name, picture || user.avatar_url, googleId, user.id]
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
router.get('/me', authMiddleware, requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
});

// Update profile
router.put('/profile', authMiddleware, requireAuth, async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;
    const userId = req.user.id;

    const result = await query(
      `UPDATE user_profiles 
       SET full_name = COALESCE($1, full_name),
           avatar_url = COALESCE($2, avatar_url),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, full_name, avatar_url, role, created_at`,
      [full_name, avatar_url, userId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

export default router;

