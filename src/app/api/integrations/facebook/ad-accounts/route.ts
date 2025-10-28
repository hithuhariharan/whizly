import { NextRequest, NextResponse } from 'next/server';
import { listFacebookAdAccounts } from '@/server/integrations/facebook';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const adAccounts = await listFacebookAdAccounts(tenantId);
    return NextResponse.json({ adAccounts });
  } catch (error) {
    console.error('Failed to list Facebook ad accounts', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
