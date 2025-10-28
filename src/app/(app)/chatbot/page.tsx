'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bot, BrainCircuit, Loader2, Sparkles, Wand2, Paperclip, Inbox, MessageSquarePlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { suggestTrainingData } from '@/ai/flows/suggest-training-data';
import { trainChatbotAgent } from '@/ai/flows/train-chatbot-agent';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import type { Conversation } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTenantProfile } from '@/hooks/use-tenant';

const mockBrochures = [
  { id: 'brochure1', name: 'Product Catalog 2024.pdf', size: '2.5 MB' },
  { id: 'brochure2', name: 'Service Tiers & Pricing.pdf', size: '800 KB' },
  { id: 'brochure3', name: 'Case Study - Acme Inc.pdf', size: '1.2 MB' },
];

type ConversationSummaries = Record<string, string>;
type ReplyDrafts = Record<string, string>;

type CreateConversationFormState = {
  source: 'facebook' | 'whatsapp' | 'manual';
  participantName: string;
  participantNumber: string;
  leadId: string;
  initialMessage: string;
};

const initialFormState: CreateConversationFormState = {
  source: 'facebook',
  participantName: '',
  participantNumber: '',
  leadId: '',
  initialMessage: '',
};

export default function ChatbotAgentPage() {
  const { toast } = useToast();
  const { tenantId } = useTenantProfile();
  const [trainingData, setTrainingData] = useState('');
  const [agentInstructions, setAgentInstructions] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [summaries, setSummaries] = useState<ConversationSummaries>({});
  const [replyDrafts, setReplyDrafts] = useState<ReplyDrafts>({});
  const [sendingConversationId, setSendingConversationId] = useState<string | null>(null);
  const [isBrochureDialogOpen, setIsBrochureDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateConversationFormState>(initialFormState);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!tenantId) return;
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`/api/chat/conversations?tenantId=${tenantId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load conversations');
      }
      const json = await response.json();
      setConversations(json.conversations || []);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Unable to load conversations', description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [tenantId, toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSuggestData = async () => {
    setIsSuggesting(true);
    try {
      const result = await suggestTrainingData({
        crmData: 'Leads: 5 new leads today. Contacts: 2 new contacts. Deals: 1 closed-won deal for $5000.',
        customerInquiries: 'Common questions include pricing, shipping times, and return policy.',
      });
      setTrainingData((prev) => prev + '\n\n' + result.suggestedTrainingData);
      toast({
        title: 'Suggestions Added',
        description: 'AI-generated training data has been added to the text area.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch suggestions.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTrainAgent = async () => {
    if (!trainingData.trim() || !agentInstructions.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both training data and agent instructions.',
      });
      return;
    }
    setIsTraining(true);
    try {
      const result = await trainChatbotAgent({
        trainingData,
        agentInstructions,
      });
      toast({
        title: 'Training Complete',
        description: result.trainingSummary,
        duration: 9000,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Training Failed',
        description: 'An error occurred while training the agent.',
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleSummarize = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || summaries[conversationId]) return;

    try {
      const conversationText = conversation.messages
        .map((message) => `${message.direction === 'outbound' ? 'Agent' : 'Customer'}: ${message.content}`)
        .join('\n');
      const result = await summarizeConversation({ conversationText });
      setSummaries((prev) => ({ ...prev, [conversationId]: result.summary }));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Summarization Failed' });
    }
  };

  const handleSendReply = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || !tenantId) return;

    const draft = replyDrafts[conversationId];
    if (!draft?.trim()) {
      toast({ variant: 'destructive', title: 'Reply required', description: 'Write a message before sending.' });
      return;
    }

    setSendingConversationId(conversationId);
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          content: draft,
          direction: 'outbound',
          channel: conversation.channel,
          recipient: conversation.participantNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const json = await response.json();
      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                messages: [...item.messages, json.message],
                lastMessagePreview: json.message.content,
                lastMessageAt: json.message.createdAt,
                updatedAt: json.message.createdAt,
              }
            : item,
        ),
      );
      setReplyDrafts((prev) => ({ ...prev, [conversationId]: '' }));
      toast({ title: 'Message sent', description: 'The message has been delivered to the contact.' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to send',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSendingConversationId(null);
    }
  };

  const handleReplyDraftChange = (conversationId: string, value: string) => {
    setReplyDrafts((prev) => ({ ...prev, [conversationId]: value }));
  };

  const handleCreateConversation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) {
      toast({ variant: 'destructive', title: 'Tenant not selected' });
      return;
    }

    setIsCreatingConversation(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          source: createForm.source,
          channel: createForm.source === 'facebook' ? 'facebook' : 'whatsapp',
          participantName: createForm.participantName,
          participantNumber: createForm.participantNumber,
          leadId: createForm.leadId || undefined,
          initialMessage: createForm.initialMessage || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create conversation');
      }

      const json = await response.json();
      setConversations((prev) => [json.conversation, ...prev]);
      setCreateForm(initialFormState);
      setIsCreateDialogOpen(false);
      toast({ title: 'Conversation created', description: 'The conversation has been added to your inbox.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Unable to create conversation', description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendBrochure = (brochureName: string) => {
    toast({
      title: 'Brochure Sent',
      description: `${brochureName} has been sent to the customer.`,
    });
    setIsBrochureDialogOpen(false);
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Inbox & Agent Training</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>
        <Tabs defaultValue="conversations">
          <TabsList className="grid w-full grid-cols-2 max-w-lg">
            <TabsTrigger value="conversations">
              <Inbox className="mr-2 h-4 w-4" />Conversations
            </TabsTrigger>
            <TabsTrigger value="train">
              <BrainCircuit className="mr-2 h-4 w-4" />Train Agent
            </TabsTrigger>
          </TabsList>
          <TabsContent value="conversations">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
                <CardDescription>
                  Review inbound leads from Facebook and WhatsApp, reply instantly, and keep your bot trained with real examples.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No conversations yet. Import a Facebook lead or start a WhatsApp chat to see it here.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {conversations.map((conversation) => (
                      <Card key={conversation.id} className="border shadow-sm">
                        <CardHeader className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {conversation.participantName
                                    .split(' ')
                                    .map((word) => word[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{conversation.participantName}</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                  {conversation.channel === 'facebook' ? 'Facebook Lead' : 'WhatsApp'} •{' '}
                                  {conversation.lastMessageAt
                                    ? new Date(conversation.lastMessageAt).toLocaleString()
                                    : 'No replies yet'}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {conversation.source}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="rounded-md border bg-muted/40 p-3 text-xs">
                            <p className="mb-2 font-medium text-muted-foreground">Transcript</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {conversation.messages.length === 0 ? (
                                <p className="text-muted-foreground">No messages yet.</p>
                              ) : (
                                conversation.messages.map((message) => (
                                  <div key={message.id} className="space-y-0.5">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                      {message.direction === 'outbound' ? 'Agent' : 'Customer'} •{' '}
                                      {new Date(message.createdAt).toLocaleString()}
                                    </p>
                                    <p className="text-sm leading-snug">{message.content}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`reply-${conversation.id}`}>Reply</Label>
                            <Textarea
                              id={`reply-${conversation.id}`}
                              placeholder="Type your response..."
                              value={replyDrafts[conversation.id] || ''}
                              onChange={(event) => handleReplyDraftChange(conversation.id, event.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsBrochureDialogOpen(true)}>
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                                Attach brochure
                              </div>
                              <Button
                                onClick={() => handleSendReply(conversation.id)}
                                disabled={sendingConversationId === conversation.id}
                              >
                                {sendingConversationId === conversation.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                  </>
                                ) : (
                                  'Send Reply'
                                )}
                              </Button>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Conversation Summary
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSummarize(conversation.id)}
                                disabled={Boolean(summaries[conversation.id])}
                              >
                                <Sparkles className="mr-2 h-3 w-3" />
                                Summarize
                              </Button>
                            </div>
                            <p className="text-sm leading-snug text-muted-foreground">
                              {summaries[conversation.id] || 'Use the summarize button to generate a quick briefing for this thread.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="train">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Train Your Chatbot</CardTitle>
                <CardDescription>
                  Provide data and instructions to train your AI agent. The more context you provide, the better it will perform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="training-data">Training Data (FAQs, conversation examples, etc.)</Label>
                  <Textarea
                    id="training-data"
                    placeholder="Q: What are your business hours?\nA: We are open from 9 AM to 5 PM, Monday to Friday."
                    className="min-h-48"
                    value={trainingData}
                    onChange={(e) => setTrainingData(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-instructions">Agent Instructions (Personality, tone, etc.)</Label>
                  <Textarea
                    id="agent-instructions"
                    placeholder="Be friendly and helpful. Keep responses concise. Your name is WhizlyBot."
                    className="min-h-24"
                    value={agentInstructions}
                    onChange={(e) => setAgentInstructions(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSuggestData} variant="outline" disabled={isSuggesting}>
                    {isSuggesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Suggest Training Data
                      </>
                    )}
                  </Button>
                  <Button onClick={handleTrainAgent} disabled={isTraining}>
                    {isTraining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Train Agent
                      </>
                    )}
                  </Button>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="conversation-strategy">
                    <AccordionTrigger>How should I structure my training data?</AccordionTrigger>
                    <AccordionContent>
                      Focus on pairing common questions with their best responses and provide several examples of the bot handling
                      objections. Include important product specs, pricing rules, and compliance statements.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tone">
                    <AccordionTrigger>What tone should the bot use?</AccordionTrigger>
                    <AccordionContent>
                      The bot can mirror your brand personality. Use the Agent Instructions field to describe tone, escalation
                      rules, and how the bot introduces itself.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isBrochureDialogOpen} onOpenChange={setIsBrochureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Brochure</DialogTitle>
            <DialogDescription>Choose a brochure to send to the customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {mockBrochures.map((brochure) => (
              <Button key={brochure.id} variant="outline" className="w-full justify-between" onClick={() => handleSendBrochure(brochure.name)}>
                <span>{brochure.name}</span>
                <span className="text-xs text-muted-foreground">{brochure.size}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Conversation</DialogTitle>
            <DialogDescription>Import a Facebook lead or start a WhatsApp chat manually.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateConversation}>
            <div className="space-y-2">
              <Label htmlFor="conversation-source">Source</Label>
              <select
                id="conversation-source"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={createForm.source}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, source: event.target.value as CreateConversationFormState['source'] }))
                }
              >
                <option value="facebook">Facebook Lead</option>
                <option value="whatsapp">WhatsApp Chat</option>
                <option value="manual">Manual Entry</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-id">Facebook Lead ID (optional)</Label>
              <Input
                id="lead-id"
                value={createForm.leadId}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, leadId: event.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participant-name">Contact Name</Label>
              <Input
                id="participant-name"
                value={createForm.participantName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, participantName: event.target.value }))}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participant-number">WhatsApp Number</Label>
              <Input
                id="participant-number"
                value={createForm.participantNumber}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, participantNumber: event.target.value }))}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-message">Initial Message</Label>
              <Textarea
                id="initial-message"
                value={createForm.initialMessage}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, initialMessage: event.target.value }))}
                placeholder="Hi! Thanks for reaching out..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreatingConversation}>
                {isCreatingConversation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreatingConversation ? 'Creating...' : 'Create Conversation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
