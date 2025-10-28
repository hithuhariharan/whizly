import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebase-admin';

export type ConversationMessageRecord = {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  channel: 'whatsapp' | 'facebook';
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ConversationRecord = {
  id: string;
  tenantId: string;
  leadId?: string;
  source: 'facebook' | 'whatsapp' | 'manual';
  channel: 'whatsapp' | 'facebook';
  participantName: string;
  participantNumber?: string;
  participantHandle?: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  messages: ConversationMessageRecord[];
};

function conversationsCollection(tenantId: string) {
  return adminDb.collection('tenants').doc(tenantId).collection('conversations');
}

export async function listConversations(tenantId: string) {
  const snapshot = await conversationsCollection(tenantId).orderBy('updatedAt', 'desc').get();
  return snapshot.docs.map((doc) => doc.data() as ConversationRecord);
}

export async function getConversation(tenantId: string, conversationId: string) {
  const snapshot = await conversationsCollection(tenantId).doc(conversationId).get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as ConversationRecord;
}

export async function createConversationRecord(conversation: ConversationRecord) {
  const ref = conversationsCollection(conversation.tenantId).doc(conversation.id);
  await ref.set({
    ...conversation,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

export async function appendConversationMessage(
  tenantId: string,
  conversationId: string,
  message: ConversationMessageRecord,
) {
  const ref = conversationsCollection(tenantId).doc(conversationId);
  await ref.update({
    messages: FieldValue.arrayUnion(message),
    lastMessagePreview: message.content,
    lastMessageAt: message.createdAt,
    updatedAt: message.createdAt,
  });
}
