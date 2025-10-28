import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { MetaIcon, RazorpayIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

const integrations = [
  {
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API to manage customer conversations directly.',
    icon: <MessageSquare className="h-10 w-10 text-green-500" />,
    connected: true,
    manageUrl: '/integrations/whatsapp',
  },
  {
    name: 'Razorpay',
    description: 'Integrate Razorpay to accept payments and manage transactions within the CRM.',
    icon: <RazorpayIcon className="h-10 w-10 text-blue-500" />,
    connected: false,
  },
  {
    name: 'Meta Pixel',
    description: 'Track website visitor activity and optimize your ad campaigns with Meta Pixel.',
    icon: <MetaIcon className="h-10 w-10 text-blue-600" />,
    connected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Integrations</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {integration.icon}
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription className="mt-1">{integration.description}</CardDescription>
                </div>
              </div>
              <Badge variant={integration.connected ? 'default' : 'secondary'}>
                {integration.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </CardHeader>
            <CardContent>
              {integration.connected ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={integration.manageUrl || '#'}>Manage</Link>
                </Button>
              ) : (
                <Button className="w-full">
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
