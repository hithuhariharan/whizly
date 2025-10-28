import { NextRequest, NextResponse } from 'next/server';
import { connectRazorpayIntegration, loadRazorpayIntegration } from '@/server/integrations/razorpay';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const integration = await loadRazorpayIntegration(tenantId);
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to load Razorpay integration', error);
    return NextResponse.json({ error: 'Failed to load Razorpay integration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, keyId, keySecret, isLive, connectedBy } = body ?? {};

  if (!tenantId || !keyId || !keySecret) {
    return NextResponse.json({ error: 'tenantId, keyId, and keySecret are required' }, { status: 400 });
  }

  try {
    const integration = await connectRazorpayIntegration({ tenantId, keyId, keySecret, isLive: Boolean(isLive), connectedBy });
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to connect Razorpay integration', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
