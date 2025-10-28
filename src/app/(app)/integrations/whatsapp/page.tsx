
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppIntegrationPage() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    toast({
      title: 'Redirecting to Facebook...',
      description: 'You will be redirected to complete the connection.',
    });
    // In a real application, this would redirect to the Facebook OAuth URL
    // For this prototype, we'll just simulate the loading state.
    setTimeout(() => {
       // window.location.href = "https://www.facebook.com/v19.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=whatsapp_business_management,whatsapp_business_messaging";
      toast({
        title: 'Connection Simulation',
        description: 'In a real app, you would now be at Facebook to grant permissions.',
      });
      setIsConnecting(false);
    }, 3000);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">WhatsApp Integration</h1>
      </div>

      <Card className="max-w-2xl mx-auto shadow-sm">
        <CardHeader className="text-center">
          <CardTitle>Connect Your WhatsApp Account</CardTitle>
          <CardDescription className="pt-2">
            Click the button below to connect your WhatsApp Business Account. You will be redirected to Facebook to approve the necessary permissions. This allows Whizly to manage your conversations and contacts securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleConnect} disabled={isConnecting} size="lg">
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Facebook className="mr-2 h-5 w-5" />
                Connect with Facebook
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex-col text-center text-xs text-muted-foreground">
          <p>
            By connecting your account, you agree to Whizly AI&apos;s Terms of Service and Privacy Policy.
          </p>
          <p className="mt-2">
             <Link href="#" className="underline">Learn more</Link> about the required permissions.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
