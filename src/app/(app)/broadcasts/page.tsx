'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for WhatsApp templates
const mockTemplates = [
  { id: 'template1', name: 'Promotional Offer (Diwali Special)', content: 'Hello {{1}}! Get 20% off on all items this Diwali. Use code DIWALI20. Shop now!' },
  { id: 'template2', name: 'Order Confirmation', content: 'Hi {{1}}, your order #{{2}} has been confirmed and will be shipped soon. Thank you for shopping with us!' },
  { id: 'template3', name: 'Appointment Reminder', content: 'Reminder: You have an appointment with {{1}} tomorrow at {{2}}.' },
];

// Mock data for contact lists
const mockContactLists = [
  { id: 'list1', name: 'All Contacts', count: 500 },
  { id: 'list2', name: 'New Leads (Last 30 Days)', count: 75 },
  { id: 'list3', name: 'High-Value Customers', count: 120 },
];

export default function BroadcastsPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    setMessageContent(template ? template.content : '');
  };

  const handleSendBroadcast = async () => {
    if (!selectedTemplate || !selectedList) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a contact list and a message template.',
      });
      return;
    }
    setIsSending(true);

    // Simulate sending broadcast
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSending(false);
    toast({
      title: 'Broadcast Sent!',
      description: `Your message is being sent to the "${mockContactLists.find(l => l.id === selectedList)?.name}" list.`,
    });
    setSelectedTemplate('');
    setSelectedList('');
    setMessageContent('');
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Create Broadcast</h1>
      </div>
      <Card className="max-w-3xl mx-auto w-full shadow-sm">
        <CardHeader>
          <CardTitle>WhatsApp Message Broadcast</CardTitle>
          <CardDescription>
            Send pre-approved template messages to your contact lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-list">Contact List</Label>
              <Select value={selectedList} onValueChange={setSelectedList}>
                <SelectTrigger id="contact-list">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {mockContactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex justify-between w-full">
                        <span>{list.name}</span>
                        <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3"/>{list.count}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="message-template">Message Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger id="message-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {mockTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="message-preview">Message Preview</Label>
            <Textarea
              id="message-preview"
              placeholder="Your message content will appear here..."
              className="min-h-32 bg-muted"
              value={messageContent}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Variables like `{{1}}` will be replaced with customer data. This is just a preview.
            </p>
          </div>
          <Button onClick={handleSendBroadcast} disabled={isSending} className="w-full sm:w-auto" size="lg">
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Broadcast
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
