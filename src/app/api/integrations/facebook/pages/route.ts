import { NextRequest, NextResponse } from 'next/server';
import { listFacebookPages } from '@/server/integrations/facebook';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const pages = await listFacebookPages(tenantId);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Failed to list Facebook pages', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
