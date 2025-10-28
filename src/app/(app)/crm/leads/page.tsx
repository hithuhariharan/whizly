'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';

import type { Lead } from '@/lib/types';
import { useTenantProfile } from '@/hooks/use-tenant';

const statusStyles = {
  New: 'default',
  Contacted: 'secondary',
  Qualified: 'outline',
  Lost: 'destructive',
} as const;

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString();
}

export default function LeadsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { tenantId, user, isTenantLoading } = useTenantProfile();

  const leadsQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'crmLeads'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: leads, isLoading: areLeadsLoading } = useCollection<Lead>(leadsQuery);

  const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firestore || !tenantId || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot create lead',
        description: 'You must be signed in to create leads.',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);

    const assignedTo = (formData.get('assignedTo') as string)?.trim();
    const creationDate = new Date().toISOString();

    const promise = addDocumentNonBlocking(collection(firestore, 'crmLeads'), {
      name: formData.get('name'),
      email: formData.get('email'),
      status: 'New',
      assignedTo: assignedTo || user.displayName || user.email || 'Unassigned',
      createdAt: creationDate,
      tenantId,
      createdBy: user.uid,
      createdByName: user.displayName || user.email || 'Unknown user',
    });

    promise?.then((docRef) => {
      if (!docRef) {
        toast({
          variant: 'destructive',
          title: 'Failed to create lead',
          description: 'We could not save this lead. Please try again.',
        });
        return;
      }

      toast({
        title: 'Lead created',
        description: 'A new lead has been added to your CRM.',
      });
    });

    e.currentTarget.reset();
    setIsSheetOpen(false);
  };

  if (isTenantLoading || areLeadsLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Leads...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Leads</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create Lead
            </span>
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Leads</CardTitle>
          <CardDescription>
            Here&apos;s a list of all leads in your CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[lead.status]}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>{lead.assignedTo}</TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
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
                        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {(!leads || leads.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No leads found yet. Create your first lead to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create a New Lead</SheetTitle>
            <SheetDescription>
              Fill out the form below to add a new lead to your CRM.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateLead} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">
                Assign To
              </Label>
              <Input id="assignedTo" name="assignedTo" placeholder="e.g., John Doe" className="col-span-3" />
            </div>
            <SheetFooter>
              <Button type="submit">Save Lead</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
