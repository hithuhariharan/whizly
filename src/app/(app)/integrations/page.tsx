
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { MetaIcon, RazorpayIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type IntegrationName = 'whatsapp' | 'razorpay' | 'metapixel';

type Integration = {
  id: IntegrationName;
  name: string;
  description: string;
  icon: JSX.Element;
  manageUrl?: string;
};

const integrationDetails: Integration[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API to manage customer conversations directly.',
    icon: <MessageSquare className="h-10 w-10 text-green-500" />,
    manageUrl: '/integrations/whatsapp',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Integrate Razorpay to accept payments and manage transactions within the CRM.',
    icon: <RazorpayIcon className="h-10 w-10" />,
  },
  {
    id: 'metapixel',
    name: 'Meta Pixel',
    description: 'Track website visitor activity and optimize your ad campaigns with Meta Pixel.',
    icon: <MetaIcon className="h-10 w-10 text-blue-600" />,
  },
];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<IntegrationName>>(new Set(['whatsapp']));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const openDialog = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleConnect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    // Simulate API call and successful connection
    toast({
      title: `${selectedIntegration.name} Connected`,
      description: `Your ${selectedIntegration.name} account has been successfully linked.`,
    });

    setConnectedIntegrations(prev => new Set(prev).add(selectedIntegration.id));
    setIsDialogOpen(false);
    setSelectedIntegration(null);
  };

  const renderDialogContent = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.id) {
      case 'razorpay':
        return (
          <form onSubmit={handleConnect} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-id">Key ID</Label>
              <Input id="key-id" placeholder="rzp_live_xxxxxxxxxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-secret">Key Secret</Label>
              <Input id="key-secret" type="password" placeholder="Your key secret" required />
            </div>
             <DialogFooter>
                <Button type="submit">Connect Razorpay</Button>
            </DialogFooter>
          </form>
        );
      case 'metapixel':
        return (
          <form onSubmit={handleConnect} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pixel-id">Pixel ID</Label>
              <Input id="pixel-id" placeholder="Your Meta Pixel ID" required />
            </div>
             <DialogFooter>
                <Button type="submit">Connect Meta Pixel</Button>
            </DialogFooter>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Integrations</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {integrationDetails.map((integration) => {
            const isConnected = connectedIntegrations.has(integration.id);
            return (
              <Card key={integration.name} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {integration.icon}
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription className="mt-1">{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={isConnected ? 'default' : 'secondary'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {isConnected ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={integration.manageUrl || '#'}>Manage</Link>
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => openDialog(integration)}>
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect your {selectedIntegration?.name} account.
            </DialogDescription>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
