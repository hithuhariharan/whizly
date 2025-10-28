import { NextRequest, NextResponse } from 'next/server';
import { appendMessage } from '@/server/chat/conversations';

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } },
) {
  const body = await request.json();
  const { tenantId, content, direction, channel, recipient } = body ?? {};

  if (!tenantId || !content || !direction || !channel) {
    return NextResponse.json({ error: 'tenantId, content, direction, and channel are required' }, { status: 400 });
  }

  try {
    const message = await appendMessage({
      tenantId,
      conversationId: params.conversationId,
      content,
      direction,
      channel,
      recipient,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Failed to append message', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
