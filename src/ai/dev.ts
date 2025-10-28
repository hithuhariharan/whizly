import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-conversation.ts';
import '@/ai/flows/suggest-training-data.ts';
import '@/ai/flows/train-chatbot-agent.ts';
import '@/ai/flows/invite-user.ts';
