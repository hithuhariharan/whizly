import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/server/firebase-admin';

export type WhatsAppIntegrationRecord = {
  tenantId: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  accessToken: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
  connectedBy?: string;
  metadata?: Record<string, unknown>;
};

export type FacebookIntegrationRecord = {
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  pageId?: string;
  pageName?: string;
  pixelId?: string;
  adAccountId?: string;
  adAccountName?: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
  connectedBy?: string;
};

export type RazorpayIntegrationRecord = {
  tenantId: string;
  keyId: string;
  keySecretEncrypted: string;
  isLive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
  connectedBy?: string;
};

function tenantIntegrationsCollection(tenantId: string) {
  return adminDb.collection('tenants').doc(tenantId).collection('integrations');
}

export async function saveWhatsAppIntegration(record: WhatsAppIntegrationRecord) {
  const ref = tenantIntegrationsCollection(record.tenantId).doc('whatsapp');
  await ref.set(
    {
      ...record,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getWhatsAppIntegration(tenantId: string) {
  const snapshot = await tenantIntegrationsCollection(tenantId).doc('whatsapp').get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as WhatsAppIntegrationRecord & { updatedAt?: Timestamp };
}

export async function saveFacebookIntegration(record: FacebookIntegrationRecord) {
  const ref = tenantIntegrationsCollection(record.tenantId).doc('facebook');
  await ref.set(
    {
      ...record,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getFacebookIntegration(tenantId: string) {
  const snapshot = await tenantIntegrationsCollection(tenantId).doc('facebook').get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as FacebookIntegrationRecord & { updatedAt?: Timestamp };
}

export async function saveRazorpayIntegration(record: RazorpayIntegrationRecord) {
  const ref = tenantIntegrationsCollection(record.tenantId).doc('razorpay');
  await ref.set(
    {
      ...record,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getRazorpayIntegration(tenantId: string) {
  const snapshot = await tenantIntegrationsCollection(tenantId).doc('razorpay').get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as RazorpayIntegrationRecord & { updatedAt?: Timestamp };
}
