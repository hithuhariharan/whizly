import { randomUUID } from 'crypto';
import { getFacebookIntegration, saveFacebookIntegration, FacebookIntegrationRecord } from '@/server/firestore/tenant-integrations';

const apiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';
const graphBase = `https://graph.facebook.com/${apiVersion}`;

export type ExchangeFacebookCodeInput = {
  tenantId: string;
  code: string;
  redirectUri: string;
  connectedBy?: string;
};

export type StoreFacebookPixelInput = {
  tenantId: string;
  pixelId: string;
};

export async function exchangeFacebookOAuthCode(input: ExchangeFacebookCodeInput) {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('META_APP_ID and META_APP_SECRET must be configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
  });

  const response = await fetch(`${graphBase}/oauth/access_token?${params.toString()}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to exchange Facebook OAuth code: ${json.error?.message || response.statusText}`);
  }

  const expiresAt = json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : undefined;

  const record: FacebookIntegrationRecord = {
    tenantId: input.tenantId,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    connectedBy: input.connectedBy,
  };

  await saveFacebookIntegration(record);

  return record;
}

export async function loadFacebookIntegration(tenantId: string) {
  return getFacebookIntegration(tenantId);
}

export async function storeFacebookPixel(input: StoreFacebookPixelInput) {
  const existing = await getFacebookIntegration(input.tenantId);
  if (!existing) {
    throw new Error('Facebook integration must be connected before storing pixel information');
  }

  const record: FacebookIntegrationRecord = {
    ...existing,
    pixelId: input.pixelId,
    tenantId: input.tenantId,
  };

  await saveFacebookIntegration(record);
  return record;
}

export async function listFacebookAdAccounts(tenantId: string) {
  const integration = await getFacebookIntegration(tenantId);
  if (!integration) {
    throw new Error('Facebook integration not configured');
  }

  const response = await fetch(`${graphBase}/me/adaccounts`, {
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
    },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to load ad accounts: ${json.error?.message || response.statusText}`);
  }

  return json.data as Array<{ id: string; name: string }>;
}

export async function listFacebookPages(tenantId: string) {
  const integration = await getFacebookIntegration(tenantId);
  if (!integration) {
    throw new Error('Facebook integration not configured');
  }

  const response = await fetch(`${graphBase}/me/accounts`, {
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
    },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to load pages: ${json.error?.message || response.statusText}`);
  }

  return json.data as Array<{ id: string; name: string; access_token?: string }>;
}

export async function fetchFacebookLead(tenantId: string, leadId: string) {
  const integration = await getFacebookIntegration(tenantId);
  if (!integration) {
    throw new Error('Facebook integration not configured');
  }

  const response = await fetch(`${graphBase}/${leadId}?fields=field_data,created_time`, {
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
    },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to load lead: ${json.error?.message || response.statusText}`);
  }

  const fieldData = (json.field_data || []) as Array<{ name: string; values: string[] }>;
  const normalized: Record<string, string | undefined> = {};
  for (const field of fieldData) {
    normalized[field.name] = field.values?.[0];
  }

  return {
    id: json.id ?? randomUUID(),
    createdAt: json.created_time,
    name: normalized.full_name || normalized.first_name || normalized.last_name,
    email: normalized.email,
    phoneNumber: normalized.phone_number,
    raw: json,
  };
}
