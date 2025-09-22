import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from './supabaseService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    profile?: any;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token with Supabase
    const { data, error } = await SupabaseService.getSession(token);

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await SupabaseService.getUserProfile(data.user.id);

    // Add user info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: data.user.id,
      email: data.user.email,
      profile: userProfile
    };

    return handler(authenticatedRequest);

  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('sb-access-token')?.value;

    const authenticatedRequest = request as AuthenticatedRequest;

    if (token) {
      try {
        // Verify token with Supabase
        const { data, error } = await SupabaseService.getSession(token);

        if (!error && data.session && data.user) {
          // Get user profile
          const userProfile = await SupabaseService.getUserProfile(data.user.id);

          // Add user info to request
          authenticatedRequest.user = {
            id: data.user.id,
            email: data.user.email,
            profile: userProfile
          };
        }
      } catch (error) {
        console.error('Optional auth error:', error);
        // Continue without user info
      }
    }

    return handler(authenticatedRequest);

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
