import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/server/integrations/razorpay';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, amount, currency, receipt, notes } = body ?? {};

  if (!tenantId || typeof amount !== 'number' || !currency || !receipt) {
    return NextResponse.json({ error: 'tenantId, amount, currency, and receipt are required' }, { status: 400 });
  }

  try {
    const order = await createRazorpayOrder({ tenantId, amount, currency, receipt, notes });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Failed to create Razorpay order', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
