
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function WhatsAppIntegrationPage() {
  const { toast } = useToast();
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingCreate(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoadingCreate(false);
      toast({
        title: 'Account Creation Initiated',
        description: 'We are setting up your new WhatsApp Business API account. You will be notified upon completion.',
      });
    }, 2000);
  };

  const handleTransferAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingTransfer(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoadingTransfer(false);
      toast({
        title: 'Account Transfer Initiated',
        description: 'Your request to transfer your existing account has been submitted. We will notify you of the status.',
      });
    }, 2000);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">WhatsApp Integration</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <form onSubmit={handleCreateAccount}>
            <CardHeader>
              <CardTitle>Create New WhatsApp Business Account</CardTitle>
              <CardDescription>
                Set up a new WhatsApp Business API account directly through Whizly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-business-name">Business Name</Label>
                <Input id="create-business-name" placeholder="Your Company LLC" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone-number">WhatsApp Phone Number</Label>
                <Input id="create-phone-number" type="tel" placeholder="+1 (555) 123-4567" required />
                <p className="text-xs text-muted-foreground">
                  This must be a number that can receive SMS or a phone call for verification.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingCreate}>
                {isLoadingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-sm">
          <form onSubmit={handleTransferAccount}>
            <CardHeader>
              <CardTitle>Transfer Existing WhatsApp Account</CardTitle>
              <CardDescription>
                Migrate your existing WhatsApp Business API account to Whizly to manage it here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-account-id">WhatsApp Business Account ID</Label>
                <Input id="transfer-account-id" placeholder="e.g., 123456789012345" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-api-key">API Key / Access Token</Label>
                <Input id="transfer-api-key" type="password" required />
                <p className="text-xs text-muted-foreground">
                  Your existing provider's API key or access token for authentication.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingTransfer}>
                {isLoadingTransfer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Initiate Transfer
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
