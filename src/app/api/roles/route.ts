export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple in-memory cache for roles (roles don't change frequently)
let rolesCache: {
  data: unknown[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// GET /api/roles - Lấy danh sách roles với caching
export async function GET() {
  try {
    const now = Date.now();
    
    // Check if cache is still valid
    if (rolesCache.data && (now - rolesCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        roles: rolesCache.data,
        cached: true
      });
    }

    // Fetch fresh data from Supabase
    const { data: rolesData, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Roles query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      );
    }

    // Update cache
    rolesCache = {
      data: rolesData || [],
      timestamp: now
    };

    return NextResponse.json({
      roles: rolesData || [],
      cached: false
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}