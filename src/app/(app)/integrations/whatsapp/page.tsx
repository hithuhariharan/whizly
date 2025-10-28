'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppIntegrationPage() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<null | 'new' | 'migrate'>(null);

  const handleConnect = (type: 'new' | 'migrate') => {
    setIsConnecting(type);
    toast({
      title: 'Redirecting to Facebook...',
      description: 'You will be redirected to complete the connection.',
    });
    // In a real application, this would redirect to the Facebook OAuth URL
    // for either new account setup or migration.
    setTimeout(() => {
      toast({
        title: 'Connection Simulation',
        description: `In a real app, you would now be at Facebook to grant permissions for ${type === 'new' ? 'a new account' : 'migration'}.`,
      });
      setIsConnecting(null);
    }, 3000);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">WhatsApp Integration</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create a New WhatsApp Business Account</CardTitle>
            <CardDescription>
              For businesses that do not have an existing WhatsApp Business API account. We'll guide you through the setup process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleConnect('new')} disabled={!!isConnecting} className="w-full" size="lg">
              {isConnecting === 'new' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="mr-2 h-5 w-5" />
                  Start Setup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Migrate an Existing WhatsApp Business Account</CardTitle>
            <CardDescription>
              Already have a WhatsApp Business API account with another provider? Easily migrate it to Whizly to manage it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleConnect('migrate')} disabled={!!isConnecting} className="w-full" size="lg">
              {isConnecting === 'migrate' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="mr-2 h-5 w-5" />
                  Start Migration
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="text-center text-xs text-muted-foreground mt-4">
          <p>
            By connecting your account, you agree to Whizly AI&apos;s Terms of Service and Privacy Policy.
          </p>
          <p className="mt-1">
             <Link href="#" className="underline">Learn more</Link> about the required permissions and migration process.
          </p>
        </div>
    </main>
  );
}
