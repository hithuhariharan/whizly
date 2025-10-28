export type Lead = {
  id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  assignedTo: string;
  createdAt: string;
  tenantId?: string;
  createdBy?: string;
  createdByName?: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  lastContacted: string;
  tenantId?: string;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
};

export type Deal = {
  id: string;
  name: string;
  contact: string;
  stage: 'Prospecting' | 'Proposal' | 'Negotiation' | 'Closed-Won' | 'Closed-Lost';
  value: number;
  closeDate: string | null;
  createdAt?: string;
  tenantId?: string;
  createdBy?: string;
  createdByName?: string;
};

export type ConversationMessage = {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  channel: 'whatsapp' | 'facebook';
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type Conversation = {
  id: string;
  tenantId?: string;
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
  messages: ConversationMessage[];
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  gstRate: number;
};

export type Invoice = {
  id: string;
  customer: string;
  customerId?: string;
  amount: number;
  amountPaid: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
  issueDate: string;
  dueDate: string;
  invoiceNumber?: string;
  tenantId?: string;
  currency?: string;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
  notes?: string;
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  gstTotal?: number;
  withholdingTax?: number;
  withholdingTaxType?: string;
  withholdingTaxRate?: number;
};

export type WhatsAppIntegration = {
  tenantId: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
};

export type FacebookIntegration = {
  tenantId: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
  pixelId?: string;
  pageId?: string;
  pageName?: string;
  adAccountId?: string;
  adAccountName?: string;
};

export type RazorpayIntegration = {
  tenantId: string;
  keyId: string;
  isLive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
};
