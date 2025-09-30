import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Simple in-memory cache for roles
let rolesCache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/roles - Lấy danh sách roles
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (rolesCache.data && (now - rolesCache.timestamp) < CACHE_DURATION) {
      return res.json({
        roles: rolesCache.data,
        cached: true
      });
    }

    // Fetch from Supabase
    const { data: rolesData, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Roles query error:', error);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }

    // Update cache
    rolesCache = {
      data: rolesData || [],
      timestamp: now
    };

    return res.json({
      roles: rolesData || [],
      cached: false
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

export default router;
