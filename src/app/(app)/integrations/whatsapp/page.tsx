'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantProfile } from '@/hooks/use-tenant';
import type { WhatsAppIntegration } from '@/lib/types';

interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  quality_score?: string;
}

export default function WhatsAppIntegrationPage() {
  const { toast } = useToast();
  const { tenantId, userProfile } = useTenantProfile();
  const [integration, setIntegration] = useState<WhatsAppIntegration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  const fetchIntegration = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await fetch(`/api/integrations/whatsapp?tenantId=${tenantId}`);
      if (!response.ok) return;
      const json = await response.json();
      setIntegration(json.integration ?? null);
    } catch (error) {
      console.error('Failed to fetch WhatsApp integration', error);
    }
  }, [tenantId]);

  const fetchTemplates = useCallback(async () => {
    if (!tenantId) return;
    setIsLoadingTemplates(true);
    try {
      const response = await fetch(`/api/integrations/whatsapp/templates?tenantId=${tenantId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unable to fetch templates');
      }
      const json = await response.json();
      setTemplates(json.templates || []);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Template sync failed', description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [tenantId, toast]);

  useEffect(() => {
    fetchIntegration();
  }, [fetchIntegration]);

  useEffect(() => {
    if (integration) {
      fetchTemplates();
    }
  }, [integration, fetchTemplates]);

  const handleConnect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) {
      toast({ variant: 'destructive', title: 'Tenant not selected', description: 'Select a workspace before connecting.' });
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/integrations/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          accessToken: formData.get('access-token'),
          businessAccountId: formData.get('business-account-id'),
          phoneNumberId: formData.get('phone-number-id'),
          connectedBy: userProfile?.displayName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect WhatsApp');
      }

      const json = await response.json();
      setIntegration(json.integration);
      toast({ title: 'WhatsApp connected', description: 'Your WhatsApp Business API is ready to use.' });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Connection failed', description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg md:text-2xl">WhatsApp Integration</h1>
          <p className="text-sm text-muted-foreground">
            Connect your WhatsApp Business Account to sync templates and send conversations from the inbox.
          </p>
        </div>
        {integration && (
          <Button variant="outline" onClick={fetchTemplates} disabled={isLoadingTemplates}>
            {isLoadingTemplates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh Templates
          </Button>
        )}
      </div>

      {!integration ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Link WhatsApp Business API</CardTitle>
            <CardDescription>
              Paste the credentials from Meta Business Manager to authorise Whizly to send and receive messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-account-id">Business Account ID</Label>
                <Input id="business-account-id" name="business-account-id" placeholder="123456789" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-number-id">Phone Number ID</Label>
                <Input id="phone-number-id" name="phone-number-id" placeholder="987654321" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Permanent Access Token</Label>
                <Input id="access-token" name="access-token" type="password" placeholder="EAAG..." required />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect WhatsApp'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
              <CardDescription>Manage the credentials that Whizly uses to call the WhatsApp Cloud API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Business Account ID</p>
                <p className="font-medium break-all">{integration.businessAccountId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Phone Number ID</p>
                <p className="font-medium break-all">{integration.phoneNumberId}</p>
              </div>
              {integration.displayPhoneNumber && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Display Number</p>
                  <p className="font-medium">{integration.displayPhoneNumber}</p>
                </div>
              )}
              {integration.verifiedName && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Verified Name</p>
                  <p className="font-medium">{integration.verifiedName}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{integration.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Connected</p>
                <p className="font-medium">{new Date(integration.connectedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Approved Templates</CardTitle>
              <CardDescription>
                These templates are synced from Meta and can be used when broadcasting or replying from the inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No templates were found for this business account. Create templates in Meta Business Manager and refresh.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {templates.map((template) => (
                    <div key={template.id} className="rounded-lg border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {template.language} • {template.category}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {template.status}
                        </span>
                      </div>
                      {template.quality_score && (
                        <p className="mt-2 text-xs text-muted-foreground">Quality: {template.quality_score}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
