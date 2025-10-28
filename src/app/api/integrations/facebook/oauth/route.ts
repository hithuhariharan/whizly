import { NextRequest, NextResponse } from 'next/server';
import { exchangeFacebookOAuthCode } from '@/server/integrations/facebook';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, code, redirectUri, connectedBy } = body ?? {};

  if (!tenantId || !code || !redirectUri) {
    return NextResponse.json({ error: 'tenantId, code, and redirectUri are required' }, { status: 400 });
  }

  try {
    const integration = await exchangeFacebookOAuthCode({ tenantId, code, redirectUri, connectedBy });
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Failed to exchange Facebook OAuth code', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
