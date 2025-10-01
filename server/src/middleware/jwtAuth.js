import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'user'
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in headers or cookies
    let token = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      req.user = null;
      return next();
    }

    // Get user from database
    const result = await query(
      'SELECT id, email, full_name, avatar_url, role, created_at FROM user_profiles WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      req.user = null;
      return next();
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Require auth
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized - Authentication required' 
    });
  }
  next();
};

// Require admin role
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized - Authentication required' 
    });
  }

  try {
    // Check if user has admin role
    const result = await query(
      `SELECT ur.role_name 
       FROM user_roles ur 
       WHERE ur.user_id = $1 AND ur.role_name = 'admin'`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Require specific role
export const requireRole = (roleName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - Authentication required' 
      });
    }

    try {
      const result = await query(
        `SELECT ur.role_name 
         FROM user_roles ur 
         WHERE ur.user_id = $1 AND ur.role_name = $2`,
        [req.user.id, roleName]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ 
          success: false,
          error: `Forbidden - ${roleName} access required` 
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  };
};

