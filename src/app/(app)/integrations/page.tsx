'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { MessageSquare, CreditCard, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTenantProfile } from '@/hooks/use-tenant';
import type { FacebookIntegration, RazorpayIntegration, WhatsAppIntegration } from '@/lib/types';

const INTEGRATION_FETCHERS = {
  whatsapp: async (tenantId: string) => {
    const res = await fetch(`/api/integrations/whatsapp?tenantId=${tenantId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.integration as WhatsAppIntegration | null;
  },
  facebook: async (tenantId: string) => {
    const res = await fetch(`/api/integrations/facebook?tenantId=${tenantId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.integration as FacebookIntegration | null;
  },
  razorpay: async (tenantId: string) => {
    const res = await fetch(`/api/integrations/razorpay?tenantId=${tenantId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.integration as RazorpayIntegration | null;
  },
};

type IntegrationName = keyof typeof INTEGRATION_FETCHERS;

type Integration = {
  id: IntegrationName;
  name: string;
  description: string;
  icon: JSX.Element;
  manageUrl?: string;
  cta?: string;
};

const integrationDetails: Integration[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API to manage customer conversations directly.',
    icon: <MessageSquare className="h-10 w-10 text-green-500" />,
    manageUrl: '/integrations/whatsapp',
    cta: 'Connect',
  },
  {
    id: 'facebook',
    name: 'Meta & Facebook Ads',
    description: 'Sync Facebook ad leads and configure your Meta Pixel tracking.',
    icon: <Share2 className="h-10 w-10 text-blue-600" />,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Integrate Razorpay to accept payments and manage transactions within the CRM.',
    icon: <CreditCard className="h-10 w-10 text-indigo-500" />,
  },
];

type IntegrationState = {
  whatsapp: WhatsAppIntegration | null;
  facebook: FacebookIntegration | null;
  razorpay: RazorpayIntegration | null;
};

const initialState: IntegrationState = {
  whatsapp: null,
  facebook: null,
  razorpay: null,
};

export default function IntegrationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { tenantId } = useTenantProfile();
  const [integrationState, setIntegrationState] = useState<IntegrationState>(initialState);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTenantLoaded = useMemo(() => Boolean(tenantId), [tenantId]);

  useEffect(() => {
    if (!tenantId) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        (Object.entries(INTEGRATION_FETCHERS) as [IntegrationName, typeof INTEGRATION_FETCHERS[IntegrationName]][]).map(
          async ([key, fetcher]) => {
            try {
              const data = await fetcher(tenantId);
              return [key, data] as const;
            } catch (error) {
              console.error(`Failed to fetch integration ${key}`, error);
              return [key, null] as const;
            }
          },
        ),
      );

      if (!cancelled) {
        setIntegrationState((prev) => ({
          ...prev,
          ...(Object.fromEntries(entries) as Partial<IntegrationState>),
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const openDialog = (integration: Integration) => {
    if (!tenantId) {
      toast({
        variant: 'destructive',
        title: 'Tenant not selected',
        description: 'Select or create a workspace before connecting integrations.',
      });
      return;
    }

    if (integration.id === 'whatsapp') {
      router.push(integration.manageUrl || '/integrations/whatsapp');
      return;
    }

    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleConnect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedIntegration || !tenantId) return;

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      if (selectedIntegration.id === 'razorpay') {
        const response = await fetch('/api/integrations/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            keyId: formData.get('key-id'),
            keySecret: formData.get('key-secret'),
            isLive: formData.get('environment') === 'live',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to connect Razorpay');
        }

        const json = await response.json();
        setIntegrationState((prev) => ({ ...prev, razorpay: json.integration }));
        toast({ title: 'Razorpay connected', description: 'Your Razorpay keys have been saved.' });
      }

      if (selectedIntegration.id === 'facebook') {
        const response = await fetch('/api/integrations/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, pixelId: formData.get('pixel-id') }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save pixel configuration');
        }

        const json = await response.json();
        setIntegrationState((prev) => ({ ...prev, facebook: json.integration }));
        toast({ title: 'Meta pixel stored', description: 'Your Meta Pixel has been linked to this workspace.' });
      }

      setIsDialogOpen(false);
      setSelectedIntegration(null);
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unable to connect integration.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDialogContent = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.id) {
      case 'razorpay':
        return (
          <form onSubmit={handleConnect} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-id">Key ID</Label>
              <Input id="key-id" name="key-id" placeholder="rzp_live_xxxxxxxxxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-secret">Key Secret</Label>
              <Input id="key-secret" name="key-secret" type="password" placeholder="Your key secret" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue="test"
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Connecting...' : 'Connect Razorpay'}
              </Button>
            </DialogFooter>
          </form>
        );
      case 'facebook':
        return (
          <form onSubmit={handleConnect} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pixel-id">Pixel ID</Label>
              <Input id="pixel-id" name="pixel-id" placeholder="Your Meta Pixel ID" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Pixel'}
              </Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg md:text-2xl">Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Connect external services to power WhatsApp conversations, Meta ads, and payments.
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {integrationDetails.map((integration) => {
            const data = integrationState[integration.id];
            const isConnected = Boolean(data);
            const isWhatsApp = integration.id === 'whatsapp';
            const isFacebook = integration.id === 'facebook';
            const isRazorpay = integration.id === 'razorpay';
            const whatsappData = isWhatsApp ? (data as WhatsAppIntegration | null) : null;
            const facebookData = isFacebook ? (data as FacebookIntegration | null) : null;
            const razorpayData = isRazorpay ? (data as RazorpayIntegration | null) : null;
            return (
              <Card key={integration.id} className="shadow-sm hover:shadow-md transition-shadow">
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
                <CardContent className="space-y-4">
                  {isFacebook && isConnected && facebookData?.pixelId && (
                    <div className="rounded-md border border-dashed border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                      Pixel ID connected: <span className="font-semibold">{facebookData.pixelId}</span>
                    </div>
                  )}
                  {isWhatsApp && isConnected && whatsappData?.displayPhoneNumber && (
                    <div className="rounded-md border border-dashed border-green-200 bg-green-50 p-3 text-xs text-green-900">
                      Connected number: {whatsappData.displayPhoneNumber}
                    </div>
                  )}
                  {isRazorpay && isConnected && razorpayData && (
                    <div className="rounded-md border border-dashed border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
                      Merchant key: {razorpayData.keyId}
                    </div>
                  )}
                  {isConnected ? (
                    integration.manageUrl ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={integration.manageUrl}>{integration.cta || 'Manage'}</Link>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="w-full"
                        variant="outline"
                        onClick={() => openDialog(integration)}
                      >
                        Update Configuration
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" onClick={() => openDialog(integration)} disabled={!isTenantLoaded}>
                      {integration.cta || 'Connect'}
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
              Enter the required credentials to link your {selectedIntegration?.name} account.
            </DialogDescription>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
