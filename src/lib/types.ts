export type Lead = {
  id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  assignedTo: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  lastContacted: string;
};

export type Deal = {
  id: string;
  name: string;
  contact: string;
  stage: 'Prospecting' | 'Proposal' | 'Negotiation' | 'Closed-Won' | 'Closed-Lost';
  value: number;
  closeDate: string;
};

export type Conversation = {
  id: string;
  customerName: string;
  startTime: string;
  summary: string;
  transcript: { speaker: string; message: string; timestamp: string }[];
};
