# **App Name**: Whizly AI

## Core Features:

- User Authentication: Secure user sign-up and sign-in using Firebase Auth (Email/Password & Google OAuth).
- Tenant Management: Enable users to create and choose a tenant to isolate data.
- WhatsApp Integration: Connect and import WhatsApp API for customer communication, leveraging API routes in Firebase Functions (connectWhatsApp, importWhatsAppAPI).
- CRM (Leads/Contacts/Deals): Manage leads, contacts, and deals within the CRM system. Secure data access by tenantId in Firestore.
- Lead Management: Create and update leads through Firebase Functions (createLead, updateLead).
- Chatbot Agent Training: Train a chatbot agent using user-provided data and view conversation histories, backed by an AI tool that determines how to best respond and/or include information during training.
- Conversation Retrieval: Retrieve conversations via Firebase Functions (getConversations).

## Style Guidelines:

- Primary color: Deep blue (#2E3192) for trust and reliability.
- Background color: Light gray (#F0F2F5), a desaturated version of the primary, for a clean, professional feel.
- Accent color: Purple (#736CED) for highlights and call-to-actions, an analogous color to the primary that stands out from the background.
- Body and headline font: 'Inter', a sans-serif font, to maintain a clear, contemporary, objective user experience.
- Use a consistent set of line icons that are easy to understand at a glance, using the accent color for highlights.
- Dashboard layout featuring clear sections for quick access to key features and CRM data.
- Use subtle animations to acknowledge user actions (e.g., form submissions, data updates).