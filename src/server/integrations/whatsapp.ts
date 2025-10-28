import { createHmac, randomUUID } from 'crypto';
import { getWhatsAppIntegration, saveWhatsAppIntegration, WhatsAppIntegrationRecord } from '@/server/firestore/tenant-integrations';

const defaultApiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';
const graphApiBase = `https://graph.facebook.com/${defaultApiVersion}`;

type WhatsAppConnectInput = {
  tenantId: string;
  accessToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  connectedBy?: string;
};

type WhatsAppTemplate = {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  quality_score?: string;
};

export type SendWhatsAppMessageInput = {
  tenantId: string;
  conversationId: string;
  to: string;
  message: string;
};

async function fetchGraph<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${graphApiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status} ${text}`);
  }

  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export async function connectWhatsAppIntegration(input: WhatsAppConnectInput) {
  const metadata = await fetchGraph<{ display_phone_number?: string; verified_name?: string }>(
    `/${input.phoneNumberId}`,
    input.accessToken,
  );

  const record: WhatsAppIntegrationRecord = {
    tenantId: input.tenantId,
    accessToken: input.accessToken,
    businessAccountId: input.businessAccountId,
    phoneNumberId: input.phoneNumberId,
    displayPhoneNumber: metadata.display_phone_number,
    verifiedName: metadata.verified_name,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    connectedBy: input.connectedBy,
  };

  await saveWhatsAppIntegration(record);

  return record;
}

export async function loadWhatsAppIntegration(tenantId: string) {
  return getWhatsAppIntegration(tenantId);
}

export async function listWhatsAppTemplates(tenantId: string) {
  const integration = await getWhatsAppIntegration(tenantId);
  if (!integration) {
    throw new Error('WhatsApp integration not configured');
  }

  const result = await fetchGraph<{ data: WhatsAppTemplate[] }>(
    `/${integration.businessAccountId}/message_templates`,
    integration.accessToken,
  );

  return result.data;
}

export async function sendWhatsAppMessage(input: SendWhatsAppMessageInput) {
  const integration = await getWhatsAppIntegration(input.tenantId);
  if (!integration) {
    throw new Error('WhatsApp integration not configured');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: input.to,
    type: 'text',
    text: {
      preview_url: false,
      body: input.message,
    },
  };

  const response = await fetch(`${graphApiBase}/${integration.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${integration.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to send WhatsApp message: ${response.status} ${text}`);
  }

  const json = text ? JSON.parse(text) : {};

  return {
    id: json.messages?.[0]?.id ?? randomUUID(),
    response: json,
  };
}

export function generateAppSecretProof(accessToken: string, appSecret?: string) {
  if (!appSecret) return undefined;
  return createHmac('sha256', appSecret).update(accessToken).digest('hex');
}
