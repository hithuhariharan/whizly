import { NextRequest, NextResponse } from 'next/server';
import { listWhatsAppTemplates } from '@/server/integrations/whatsapp';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const templates = await listWhatsAppTemplates(tenantId);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to fetch WhatsApp templates', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
