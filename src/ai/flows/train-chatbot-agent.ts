'use server';

/**
 * @fileOverview This file defines a Genkit flow for training a chatbot agent.
 *
 * The flow takes training data as input and uses it to train the agent, leveraging
 * a prompt to refine the training process. The file exports:
 *
 * - `trainChatbotAgent`: The function to trigger the chatbot training flow.
 * - `TrainChatbotAgentInput`: The TypeScript type definition for the input schema.
 * - `TrainChatbotAgentOutput`: The TypeScript type definition for the output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TrainChatbotAgentInputSchema = z.object({
  trainingData: z
    .string()
    .describe(
      'The training data for the chatbot agent.  This could include example conversations, FAQs, or other relevant information.'
    ),
  agentInstructions: z
    .string()
    .describe(
      'Specific instructions for the agent, such as its tone, personality, and areas of expertise.'
    ),
});

export type TrainChatbotAgentInput = z.infer<typeof TrainChatbotAgentInputSchema>;

const TrainChatbotAgentOutputSchema = z.object({
  trainingSummary: z
    .string()
    .describe(
      'A summary of the training process, including any key insights or adjustments made.'
    ),
});

export type TrainChatbotAgentOutput = z.infer<typeof TrainChatbotAgentOutputSchema>;

export async function trainChatbotAgent(
  input: TrainChatbotAgentInput
): Promise<TrainChatbotAgentOutput> {
  return trainChatbotAgentFlow(input);
}

const trainChatbotAgentPrompt = ai.definePrompt({
  name: 'trainChatbotAgentPrompt',
  input: {schema: TrainChatbotAgentInputSchema},
  output: {schema: TrainChatbotAgentOutputSchema},
  prompt: `You are an expert in training chatbot agents.  Your goal is to take the provided training data and agent instructions and generate a summary of the training process.

  Training Data:
  {{trainingData}}

  Agent Instructions:
  {{agentInstructions}}

  Provide a concise summary of the training process, highlighting any key insights or adjustments made to optimize the agent's performance. The training summary should be well-formatted and easy to understand.

  Training Summary:`,
});

const trainChatbotAgentFlow = ai.defineFlow(
  {
    name: 'trainChatbotAgentFlow',
    inputSchema: TrainChatbotAgentInputSchema,
    outputSchema: TrainChatbotAgentOutputSchema,
  },
  async input => {
    const {output} = await trainChatbotAgentPrompt(input);
    return output!;
  }
);
