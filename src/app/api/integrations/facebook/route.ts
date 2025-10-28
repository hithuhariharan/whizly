import { NextRequest, NextResponse } from 'next/server';
import { loadFacebookIntegration, storeFacebookPixel } from '@/server/integrations/facebook';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const integration = await loadFacebookIntegration(tenantId);
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to load Facebook integration', error);
    return NextResponse.json({ error: 'Failed to load Facebook integration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, pixelId } = body ?? {};

  if (!tenantId || !pixelId) {
    return NextResponse.json({ error: 'tenantId and pixelId are required' }, { status: 400 });
  }

  try {
    const integration = await storeFacebookPixel({ tenantId, pixelId });
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to store Facebook pixel information', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
