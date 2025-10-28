import { createHmac } from 'crypto';
import { getRazorpayIntegration, saveRazorpayIntegration, RazorpayIntegrationRecord } from '@/server/firestore/tenant-integrations';

export type ConnectRazorpayInput = {
  tenantId: string;
  keyId: string;
  keySecret: string;
  isLive: boolean;
  connectedBy?: string;
};

export type CreateRazorpayOrderInput = {
  tenantId: string;
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
};

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
};

function getAuthHeader(keyId: string, keySecret: string) {
  const creds = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${creds}`;
}

function decryptSecret(record: RazorpayIntegrationRecord) {
  const secret = Buffer.from(record.keySecretEncrypted, 'base64').toString('utf8');
  return secret;
}

export async function connectRazorpayIntegration(input: ConnectRazorpayInput) {
  const keySecretEncrypted = Buffer.from(input.keySecret).toString('base64');

  const record: RazorpayIntegrationRecord = {
    tenantId: input.tenantId,
    keyId: input.keyId,
    keySecretEncrypted,
    isLive: input.isLive,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    connectedBy: input.connectedBy,
  };

  await saveRazorpayIntegration(record);
  return record;
}

export async function loadRazorpayIntegration(tenantId: string) {
  return getRazorpayIntegration(tenantId);
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  const integration = await getRazorpayIntegration(input.tenantId);
  if (!integration) {
    throw new Error('Razorpay integration not configured');
  }

  const keySecret = decryptSecret(integration);
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(integration.keyId, keySecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create Razorpay order: ${json.error?.description || response.statusText}`);
  }

  return json as RazorpayOrderResponse;
}

export function verifyRazorpaySignature(payload: string, signature: string, webhookSecret: string) {
  const digest = createHmac('sha256', webhookSecret).update(payload).digest('hex');
  return digest === signature;
}
