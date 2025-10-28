'use server';
/**
 * @fileOverview A user invitation flow for the Whizly AI application.
 *
 * - inviteUser - A function to handle user invitations.
 * - InviteUserInput - The input type for the inviteUser function.
 * - InviteUserOutput - The return type for the inviteUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InviteUserInputSchema = z.object({
  email: z.string().email().describe('The email address of the user to invite.'),
  role: z
    .enum(['Admin', 'Manager', 'Agent'])
    .describe('The role to assign to the invited user when they accept the invitation.'),
});
export type InviteUserInput = z.infer<typeof InviteUserInputSchema>;

const InviteUserOutputSchema = z.object({
  inviteLink: z.string().url().describe("The unique sign-up link for the invited user."),
});
export type InviteUserOutput = z.infer<typeof InviteUserOutputSchema>;

export async function inviteUser(input: InviteUserInput): Promise<InviteUserOutput> {
  return inviteUserFlow(input);
}

const inviteUserFlow = ai.defineFlow(
  {
    name: 'inviteUserFlow',
    inputSchema: InviteUserInputSchema,
    outputSchema: InviteUserOutputSchema,
  },
  async input => {
    // In a real application, this flow would:
    // 1. Generate a unique, secure token for the invitation.
    // 2. Store the invitation details (email, role, tenant assignments, token, status: 'pending') in Firestore.
    // 3. Construct a sign-up URL with the invitation token.
    // 4. (Optional) Use a service like SendGrid or Firebase Extensions to email the link to the user.

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    // This is a simplified, insecure example. A real implementation would use a secure token.
    const inviteToken = Buffer.from(JSON.stringify(input)).toString('base64url');
    const inviteLink = `${baseUrl}/signup?invite=${inviteToken}`;

    return {
      inviteLink,
    };
  }
);
