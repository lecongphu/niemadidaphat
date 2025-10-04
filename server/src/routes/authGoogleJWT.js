import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool, { transaction } from '../config/database.js';

const router = express.Router();

// Initialize Google OAuth2Client
const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// JWT Secret từ environment
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET không được cấu hình trong environment variables');
  process.exit(1);
}

/**
 * Verify Google ID token và tạo user session
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential không được cung cấp'
      });
    }

    console.log('🔐 Verifying Google credential...');

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({
        success: false,
        error: 'Không thể xác thực Google token'
      });
    }

    const {
      sub: google_id,
      email,
      name: full_name,
      picture: avatar_url,
      email_verified
    } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email Google chưa được xác thực'
      });
    }

    console.log('✅ Google token verified for:', email);

    // Tìm hoặc tạo user trong database
    const result = await transaction(async (client) => {
      // Tìm user theo email hoặc google_id
      const existingUser = await client.query(
        `SELECT * FROM user_profiles 
         WHERE email = $1 OR google_id = $2`,
        [email, google_id]
      );

      let user;

      if (existingUser.rows.length > 0) {
        // User đã tồn tại, cập nhật thông tin
        user = existingUser.rows[0];
        
        const updateResult = await client.query(
          `UPDATE user_profiles 
           SET full_name = $1, avatar_url = $2, google_id = $3, 
               last_active = NOW(), last_login_at = NOW(), 
               login_count = login_count + 1, updated_at = NOW()
           WHERE id = $4
           RETURNING *`,
          [full_name, avatar_url, google_id, user.id]
        );

        user = updateResult.rows[0];
        console.log('🔄 Updated existing user:', user.email);
      } else {
        // Tạo user mới
        const insertResult = await client.query(
          `INSERT INTO user_profiles 
           (email, full_name, avatar_url, provider, google_id, 
            created_at, updated_at, last_active, last_login_at, login_count)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), NOW(), 1)
           RETURNING *`,
          [email, full_name, avatar_url, 'google', google_id]
        );

        user = insertResult.rows[0];
        console.log('🆕 Created new user:', user.email);

        // Tạo default user role
        await client.query(
          `INSERT INTO user_roles (id, role, is_active, created_at, updated_at, assigned_at)
           VALUES ($1, $2, true, NOW(), NOW(), NOW())`,
          [user.id, 'user']
        );
      }

      return user;
    });

    // Tạo JWT token
    const tokenPayload = {
      user_id: result.id,
      email: result.email,
      provider: 'google',
      google_id: result.google_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'niemadidaphat',
      audience: 'niemadidaphat-users'
    });

    // Tính toán thời gian hết hạn
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    console.log('🎉 Authentication successful for:', result.email);

    res.json({
      success: true,
      data: {
        user: {
          id: result.id,
          email: result.email,
          full_name: result.full_name,
          avatar_url: result.avatar_url,
          provider: result.provider,
          google_id: result.google_id,
          created_at: result.created_at,
          last_active: result.last_active
        },
        token,
        expires_at: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Google authentication error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi xác thực Google'
    });
  }
});

/**
 * Lấy thông tin user hiện tại từ JWT token
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token không được cung cấp'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'niemadidaphat',
      audience: 'niemadidaphat-users'
    });

    // Lấy thông tin user từ database
    const result = await pool.query(
      `SELECT id, email, full_name, avatar_url, provider, google_id, 
              created_at, last_active, login_count, last_login_at
       FROM user_profiles 
       WHERE id = $1`,
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User không tồn tại'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        google_id: user.google_id,
        created_at: user.created_at,
        last_active: user.last_active
      }
    });

  } catch (error) {
    console.error('❌ Get user info error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi lấy thông tin user'
    });
  }
});

/**
 * Đăng xuất (invalidate token)
 */
router.post('/logout', async (req, res) => {
  try {
    // Trong hệ thống JWT stateless, chúng ta không thể invalidate token
    // Client sẽ tự xóa token khỏi localStorage
    // Trong tương lai có thể implement token blacklist nếu cần
    
    console.log('👋 User logged out');
    
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi đăng xuất'
    });
  }
});

/**
 * Refresh token (nếu cần)
 */
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token không được cung cấp'
      });
    }

    const token = authHeader.substring(7);

    // Verify token (có thể đã hết hạn)
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'niemadidaphat',
      audience: 'niemadidaphat-users',
      ignoreExpiration: true // Cho phép token hết hạn để refresh
    });

    // Kiểm tra user còn tồn tại không
    const result = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User không tồn tại'
      });
    }

    // Tạo token mới
    const newTokenPayload = {
      user_id: decoded.user_id,
      email: decoded.email,
      provider: decoded.provider,
      google_id: decoded.google_id
    };

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'niemadidaphat',
      audience: 'niemadidaphat-users'
    });

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    
    res.status(401).json({
      success: false,
      error: 'Token không thể refresh'
    });
  }
});

export default router;
