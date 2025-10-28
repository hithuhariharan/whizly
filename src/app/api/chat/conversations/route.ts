import { NextRequest, NextResponse } from 'next/server';
import { createConversation, listTenantConversations } from '@/server/chat/conversations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  try {
    const conversations = await listTenantConversations(tenantId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to list conversations', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, source, channel, participantName, participantNumber, participantHandle, leadId, initialMessage } = body ?? {};

  if (!tenantId || !source || !channel) {
    return NextResponse.json({ error: 'tenantId, source, and channel are required' }, { status: 400 });
  }

  try {
    const conversation = await createConversation({
      tenantId,
      source,
      channel,
      participantName,
      participantNumber,
      participantHandle,
      leadId,
      initialMessage,
    });
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Failed to create conversation', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
