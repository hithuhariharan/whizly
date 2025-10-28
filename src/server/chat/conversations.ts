import { randomUUID } from 'crypto';
import {
  appendConversationMessage,
  ConversationMessageRecord,
  ConversationRecord,
  createConversationRecord,
  getConversation,
  listConversations,
} from '@/server/firestore/conversations';
import { fetchFacebookLead } from '@/server/integrations/facebook';
import { sendWhatsAppMessage } from '@/server/integrations/whatsapp';

export async function listTenantConversations(tenantId: string) {
  return listConversations(tenantId);
}

type CreateConversationInput = {
  tenantId: string;
  source: 'facebook' | 'whatsapp' | 'manual';
  channel: 'whatsapp' | 'facebook';
  participantName?: string;
  participantNumber?: string;
  participantHandle?: string;
  leadId?: string;
  initialMessage?: string;
};

export async function createConversation(input: CreateConversationInput) {
  const now = new Date().toISOString();
  let participantName = input.participantName;
  let participantNumber = input.participantNumber;

  if (input.source === 'facebook' && input.leadId) {
    const lead = await fetchFacebookLead(input.tenantId, input.leadId);
    participantName = participantName || lead.name || 'Facebook Lead';
    participantNumber = participantNumber || lead.phoneNumber;
  }

  const conversation: ConversationRecord = {
    id: randomUUID(),
    tenantId: input.tenantId,
    source: input.source,
    channel: input.channel,
    participantName: participantName || 'Unknown Contact',
    participantNumber,
    participantHandle: input.participantHandle,
    leadId: input.leadId,
    createdAt: now,
    updatedAt: now,
    lastMessagePreview: input.initialMessage || undefined,
    lastMessageAt: input.initialMessage ? now : undefined,
    messages: input.initialMessage
      ? [
          {
            id: randomUUID(),
            direction: 'outbound',
            content: input.initialMessage,
            channel: input.channel,
            createdAt: now,
          } satisfies ConversationMessageRecord,
        ]
      : [],
  };

  await createConversationRecord(conversation);
  return conversation;
}

type AppendMessageInput = {
  tenantId: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  channel: 'whatsapp' | 'facebook';
  recipient?: string;
};

export async function appendMessage(input: AppendMessageInput) {
  const conversation = await getConversation(input.tenantId, input.conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const createdAt = new Date().toISOString();
  const message: ConversationMessageRecord = {
    id: randomUUID(),
    direction: input.direction,
    content: input.content,
    channel: input.channel,
    createdAt,
  };

  if (input.direction === 'outbound' && input.channel === 'whatsapp' && input.recipient) {
    await sendWhatsAppMessage({
      tenantId: input.tenantId,
      conversationId: input.conversationId,
      to: input.recipient,
      message: input.content,
    });
  }

  await appendConversationMessage(input.tenantId, input.conversationId, message);

  return {
    ...message,
    createdAt,
  };
}
