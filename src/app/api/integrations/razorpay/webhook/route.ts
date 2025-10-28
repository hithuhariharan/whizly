import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/server/integrations/razorpay';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 });
  }

  const isValid = verifyRazorpaySignature(payload, signature, webhookSecret);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('Razorpay webhook event received', payload);
  return NextResponse.json({ success: true });
}
