import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeedbackUpdate {
  status?: string;
  priority?: string;
  admin_notes?: string;
  updated_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Get user info from Authorization header if available
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.warn('Error verifying Supabase token:', error);
      }
    }

    // Validation
    if (!message) {
      return NextResponse.json(
        { error: 'Nội dung góp ý là bắt buộc' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Nội dung góp ý phải từ 10-5000 ký tự' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert feedback to Supabase
    const feedbackData = {
      message: message.trim(),
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'pending',
      priority: 'medium',
      user_type: userId ? 'registered' : 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert feedback: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Góp ý của bạn đã được gửi thành công. Cảm ơn bạn!',
      id: data.id
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Lỗi server. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Build Supabase query
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by priority
    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    // Apply same filters to count query
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (priority !== 'all') {
      countQuery = countQuery.eq('priority', priority);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, admin_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID góp ý là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    const updateData: FeedbackUpdate = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update feedback in Supabase
    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Feedback PUT API error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID góp ý là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Delete feedback from Supabase
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Góp ý đã được xóa thành công'
    });

  } catch (error) {
    console.error('Feedback DELETE API error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
