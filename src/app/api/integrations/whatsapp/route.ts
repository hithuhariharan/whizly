import { NextRequest, NextResponse } from 'next/server';
import { connectWhatsAppIntegration, loadWhatsAppIntegration } from '@/server/integrations/whatsapp';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const integration = await loadWhatsAppIntegration(tenantId);
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to load WhatsApp integration', error);
    return NextResponse.json({ error: 'Failed to load WhatsApp integration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, accessToken, businessAccountId, phoneNumberId, connectedBy } = body ?? {};

  if (!tenantId || !accessToken || !businessAccountId || !phoneNumberId) {
    return NextResponse.json({ error: 'tenantId, accessToken, businessAccountId, and phoneNumberId are required' }, { status: 400 });
  }

  try {
    const integration = await connectWhatsAppIntegration({
      tenantId,
      accessToken,
      businessAccountId,
      phoneNumberId,
      connectedBy,
    });

    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to connect WhatsApp integration', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
