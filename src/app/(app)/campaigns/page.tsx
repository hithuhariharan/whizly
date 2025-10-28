
'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal, Facebook, Bot } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Campaign = {
  id: string;
  name: string;
  type: 'Facebook Click-to-WhatsApp';
  status: 'Active' | 'Paused' | 'Draft';
  chatbotAgent: string;
  leadsGenerated: number;
};

const mockCampaigns: Campaign[] = [
    { id: '1', name: 'Diwali Sale 2023', type: 'Facebook Click-to-WhatsApp', status: 'Active', chatbotAgent: 'Sales Bot', leadsGenerated: 125 },
    { id: '2', name: 'New Year Offer', type: 'Facebook Click-to-WhatsApp', status: 'Paused', chatbotAgent: 'Lead Qualification Bot', leadsGenerated: 88 },
    { id: '3', name: 'Summer Discount Campaign', type: 'Facebook Click-to-WhatsApp', status: 'Draft', chatbotAgent: 'Support Bot', leadsGenerated: 0 },
];

const statusStyles = {
  Active: 'default',
  Paused: 'secondary',
  Draft: 'outline',
} as const;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCampaign: Campaign = {
      id: (campaigns.length + 1).toString(),
      name: formData.get('name') as string,
      type: 'Facebook Click-to-WhatsApp',
      status: 'Draft',
      chatbotAgent: formData.get('agent') as string,
      leadsGenerated: 0,
    };
    setCampaigns([newCampaign, ...campaigns]);
    setIsSheetOpen(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Campaigns</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create Campaign
            </span>
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Campaigns</CardTitle>
          <CardDescription>
            Create and manage your lead generation campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Chatbot Agent</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span>{campaign.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.chatbotAgent}</span>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.leadsGenerated}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[campaign.status]}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Pause</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Campaign</SheetTitle>
            <SheetDescription>
              Set up a new campaign to start generating leads.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateCampaign} className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" name="name" placeholder="e.g., 'Summer Sale'" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="type">Campaign Type</Label>
               <Select defaultValue="c2wa" name="type">
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c2wa">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span>Facebook Click-to-WhatsApp</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent">Assign Chatbot Agent</Label>
              <Select name="agent">
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales Bot">Sales Bot</SelectItem>
                  <SelectItem value="Lead Qualification Bot">Lead Qualification Bot</SelectItem>
                  <SelectItem value="Support Bot">Support Bot</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="pixel-id">Facebook Pixel ID</Label>
              <Input id="pixel-id" name="pixel-id" placeholder="Enter your Pixel ID to track events" />
               <p className="text-xs text-muted-foreground">
                 This allows Whizly to send 'QualifiedLead' events back to Facebook.
               </p>
            </div>
            <SheetFooter className="mt-4">
              <Button type="submit">Create Campaign</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
