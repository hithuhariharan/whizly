'use server';
/**
 * @fileOverview AI-powered call analysis flow.
 *
 * - analyzeCall - Analyzes a call transcript to generate a summary and performance feedback.
 * - AnalyzeCallInput - The input type for the analyzeCall function.
 * - AnalyzeCallOutput - The return type for the analyzeCall function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeCallInputSchema = z.object({
  callTranscript: z
    .string()
    .describe('The full text transcript of a customer service or sales call.'),
});
export type AnalyzeCallInput = z.infer<typeof AnalyzeCallInputSchema>;

const AnalyzeCallOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the call, including key points, customer needs, and action items.'),
  performanceFeedback: z
    .string()
    .describe(
      'Constructive feedback for the employee on their performance during the call. Focus on tone, clarity, problem resolution, and adherence to company guidelines.'
    ),
});
export type AnalyzeCallOutput = z.infer<typeof AnalyzeCallOutputSchema>;

export async function analyzeCall(
  input: AnalyzeCallInput
): Promise<AnalyzeCallOutput> {
  return analyzeCallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCallPrompt',
  input: { schema: AnalyzeCallInputSchema },
  output: { schema: AnalyzeCallOutputSchema },
  prompt: `You are an expert AI assistant for a business named Whizly AI. Your task is to analyze a call transcript between an employee and a customer.

  Based on the transcript provided, perform two tasks:
  1.  **Generate a Summary**: Create a concise summary of the conversation. Extract the customer's main needs, any important details, and list clear action items for the employee.
  2.  **Generate Performance Feedback**: Provide constructive feedback for the employee. Analyze their tone, clarity, helpfulness, and efficiency. Suggest specific areas for improvement.

  Call Transcript:
  '''
  {{{callTranscript}}}
  '''
  `,
});

const analyzeCallFlow = ai.defineFlow(
  {
    name: 'analyzeCallFlow',
    inputSchema: AnalyzeCallInputSchema,
    outputSchema: AnalyzeCallOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
