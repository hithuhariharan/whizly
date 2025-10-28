'use client';

import { useState } from 'react';
import { Bot, BrainCircuit, Loader2, Sparkles, Wand2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { suggestTrainingData } from '@/ai/flows/suggest-training-data';
import { trainChatbotAgent } from '@/ai/flows/train-chatbot-agent';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import type { Conversation } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    customerName: 'Daniel Lee',
    startTime: '2023-10-26 10:00 AM',
    summary: '',
    transcript: [
      { speaker: 'Customer', message: 'Hi, I have a question about my recent order.', timestamp: '10:00:15' },
      { speaker: 'Agent', message: 'Of course, I can help with that. What is your order number?', timestamp: '10:00:30' },
      { speaker: 'Customer', message: 'It\'s #12345.', timestamp: '10:00:45' },
      { speaker: 'Agent', message: 'Thank you. I see your order was shipped yesterday. Is there a specific issue?', timestamp: '10:01:10' },
      { speaker: 'Customer', message: 'Yes, the tracking link isn\'t working.', timestamp: '10:01:25' },
    ],
  },
  {
    id: 'conv2',
    customerName: 'Sophie Chen',
    startTime: '2023-10-26 11:30 AM',
    summary: '',
    transcript: [
      { speaker: 'Customer', message: 'I want to know more about your return policy.', timestamp: '11:30:05' },
      { speaker: 'Agent', message: 'We offer a 30-day return policy on all items. You can find more details on our website.', timestamp: '11:30:20' },
    ],
  },
];

export default function ChatbotAgentPage() {
  const { toast } = useToast();
  const [trainingData, setTrainingData] = useState('');
  const [agentInstructions, setAgentInstructions] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const handleSuggestData = async () => {
    setIsSuggesting(true);
    try {
      const result = await suggestTrainingData({
        crmData: 'Leads: 5 new leads today. Contacts: 2 new contacts. Deals: 1 closed-won deal for $5000.',
        customerInquiries: 'Common questions include pricing, shipping times, and return policy.',
      });
      setTrainingData(
        (prev) => prev + '\n\n' + result.suggestedTrainingData
      );
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

  const handleSummarize = async (convId: string) => {
    const conversation = conversations.find(c => c.id === convId);
    if (!conversation || conversation.summary) return;

    setSummarizingId(convId);
    try {
      const conversationText = conversation.transcript.map(t => `${t.speaker}: ${t.message}`).join('\n');
      const result = await summarizeConversation({ conversationText });
      setConversations(convs => convs.map(c => c.id === convId ? { ...c, summary: result.summary } : c));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Summarization Failed' });
    } finally {
      setSummarizingId(null);
    }
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Chatbot Agent</h1>
      </div>
      <Tabs defaultValue="train">
        <TabsList className="grid w-full grid-cols-2 max-w-lg">
          <TabsTrigger value="train"><BrainCircuit className="mr-2 h-4 w-4" />Train Agent</TabsTrigger>
          <TabsTrigger value="conversations"><Bot className="mr-2 h-4 w-4" />Conversations</TabsTrigger>
        </TabsList>
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
                  placeholder="Q: What are your business hours?&#10;A: We are open from 9 AM to 5 PM, Monday to Friday."
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest Data with AI
                </Button>
                <Button onClick={handleTrainAgent} disabled={isTraining} className="sm:ml-auto">
                  {isTraining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Train Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="conversations">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>
                Review past conversations handled by your agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {conversations.map((conv) => (
                  <AccordionItem value={conv.id} key={conv.id}>
                    <AccordionTrigger onClick={() => handleSummarize(conv.id)}>
                      <div className="flex justify-between w-full pr-4">
                        <span>{conv.customerName}</span>
                        <span className="text-sm text-muted-foreground">{conv.startTime}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      {conv.summary || summarizingId === conv.id ? (
                        <Card className="mb-4 bg-muted/50 border-dashed">
                          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
                            <Sparkles className="h-4 w-4 text-primary"/>
                            <CardTitle className="text-base">AI Summary</CardTitle>
                            {summarizingId === conv.id && <Loader2 className="h-4 w-4 animate-spin" />}
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {conv.summary || "Generating summary..."}
                            </p>
                          </CardContent>
                        </Card>
                      ) : null}

                      <div className="space-y-4">
                        {conv.transcript.map((item, index) => (
                          <div key={index} className={`flex items-start gap-3 ${item.speaker === 'Customer' ? '' : 'justify-end'}`}>
                            {item.speaker === 'Customer' && <Avatar className="w-8 h-8 border"><AvatarFallback>C</AvatarFallback></Avatar>}
                            <div className={`p-3 rounded-lg max-w-[75%] ${item.speaker === 'Customer' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                              <p className="text-sm">{item.message}</p>
                              <p className="text-xs opacity-70 mt-1">{item.timestamp}</p>
                            </div>
                            {item.speaker !== 'Customer' && <Avatar className="w-8 h-8 border"><AvatarFallback>A</AvatarFallback></Avatar>}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
