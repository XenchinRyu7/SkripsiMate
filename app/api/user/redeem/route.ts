// Redeem Coupon API
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Get user ID from Firebase token (placeholder - implement proper auth)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Call the redeem_coupon function
    const { data, error } = await supabaseAdmin
      .rpc('redeem_coupon', {
        coupon_code_input: code.toUpperCase(),
        user_id_input: userId,
      });

    if (error) {
      console.error('Redeem error:', error);
      return NextResponse.json(
        { error: 'Failed to redeem coupon' },
        { status: 500 }
      );
    }

    if (!data || !data[0]?.success) {
      return NextResponse.json(
        { error: data?.[0]?.message || 'Invalid or expired coupon' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data[0].message,
      subscription_id: data[0].subscription_id,
    });

  } catch (error: any) {
    console.error('Error redeeming coupon:', error);
    return NextResponse.json(
      { error: 'Failed to redeem coupon' },
      { status: 500 }
    );
  }
}

