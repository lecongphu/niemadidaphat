import express from 'express';
import bcrypt from 'bcrypt';
import { query, transaction } from '../config/database.js';
import { generateToken, authMiddleware, requireAuth } from '../middleware/jwtAuth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email và password là bắt buộc'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email không hợp lệ'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM user_profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in transaction
    const result = await transaction(async (client) => {
      // Insert into user_profiles
      const userResult = await client.query(
        `INSERT INTO user_profiles (email, password_hash, full_name, avatar_url, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, full_name, avatar_url, role, created_at`,
        [email, hashedPassword, full_name || '', '', 'user']
      );

      const user = userResult.rows[0];

      // Insert default user role
      await client.query(
        'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)',
        [user.id, 'user']
      );

      return user;
    });

    // Generate token
    const token = generateToken(result);

    res.status(201).json({
      success: true,
      data: {
        user: result,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tạo tài khoản'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email và password là bắt buộc'
      });
    }

    // Get user from database
    const result = await query(
      `SELECT id, email, password_hash, full_name, avatar_url, role, created_at 
       FROM user_profiles 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Remove password_hash from response
    delete user.password_hash;

    // Generate token
    const token = generateToken(user);

    // Set cookie (optional)
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi đăng nhập'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
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
      error: 'Lỗi khi lấy thông tin người dùng'
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
      error: 'Lỗi khi cập nhật thông tin'
    });
  }
});

// Change password
router.put('/password', authMiddleware, requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM user_profiles WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Người dùng không tồn tại'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      current_password,
      result.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await query(
      'UPDATE user_profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi đổi mật khẩu'
    });
  }
});

export default router;

