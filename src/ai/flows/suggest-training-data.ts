'use server';

/**
 * @fileOverview AI-powered training data suggestion flow.
 *
 * - suggestTrainingData - A function that suggests training data for the chatbot agent.
 * - SuggestTrainingDataInput - The input type for the suggestTrainingData function.
 * - SuggestTrainingDataOutput - The return type for the suggestTrainingData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrainingDataInputSchema = z.object({
  crmData: z.string().describe('Existing CRM data including leads, contacts, and deals.'),
  customerInquiries: z.string().describe('Common customer inquiries or questions.'),
});
export type SuggestTrainingDataInput = z.infer<typeof SuggestTrainingDataInputSchema>;

const SuggestTrainingDataOutputSchema = z.object({
  suggestedTrainingData: z
    .string()
    .describe('AI-generated suggestions for training data in a question/answer format.'),
});
export type SuggestTrainingDataOutput = z.infer<typeof SuggestTrainingDataOutputSchema>;

export async function suggestTrainingData(
  input: SuggestTrainingDataInput
): Promise<SuggestTrainingDataOutput> {
  return suggestTrainingDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrainingDataPrompt',
  input: {schema: SuggestTrainingDataInputSchema},
  output: {schema: SuggestTrainingDataOutputSchema},
  prompt: `You are an AI assistant that suggests training data for a chatbot agent.

  Based on the existing CRM data and common customer inquiries, generate suggestions
  for training data in a question/answer format. The goal is to improve the chatbot's
  ability to handle customer interactions effectively.

  CRM Data: {{{crmData}}}
  Customer Inquiries: {{{customerInquiries}}}

  Suggestions:
`,
});

const suggestTrainingDataFlow = ai.defineFlow(
  {
    name: 'suggestTrainingDataFlow',
    inputSchema: SuggestTrainingDataInputSchema,
    outputSchema: SuggestTrainingDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
