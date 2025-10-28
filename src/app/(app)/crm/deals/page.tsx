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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { Deal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useTenantProfile } from '@/hooks/use-tenant';

const stageStyles = {
  Prospecting: 'default',
  Proposal: 'secondary',
  Negotiation: 'secondary',
  'Closed-Won': 'outline',
  'Closed-Lost': 'destructive',
} as const;

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function DealsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { tenantId, user, isTenantLoading } = useTenantProfile();

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'crmDeals'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: deals, isLoading: areDealsLoading } = useCollection<Deal>(dealsQuery);

  const handleCreateDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firestore || !tenantId || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot create deal',
        description: 'You must be signed in to create deals.',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString();

    const promise = addDocumentNonBlocking(collection(firestore, 'crmDeals'), {
      name: formData.get('name'),
      contact: formData.get('contact'),
      stage: formData.get('stage') || 'Prospecting',
      value: Number(formData.get('value')) || 0,
      closeDate: formData.get('closeDate') || null,
      createdAt: now,
      tenantId,
      createdBy: user.uid,
      createdByName: user.displayName || user.email || 'Unknown user',
    });

    promise?.then((docRef) => {
      if (!docRef) {
        toast({
          variant: 'destructive',
          title: 'Failed to create deal',
          description: 'We could not save this deal. Please try again.',
        });
        return;
      }

      toast({
        title: 'Deal created',
        description: 'A new deal has been added to your pipeline.',
      });
    });

    e.currentTarget.reset();
    setIsSheetOpen(false);
  };

  if (isTenantLoading || areDealsLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Deals...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Deals</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create Deal
            </span>
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Deals</CardTitle>
          <CardDescription>
            A list of all deals in your pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expected Close Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals?.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.contact}</TableCell>
                  <TableCell>
                    <Badge variant={stageStyles[deal.stage]}>{deal.stage}</Badge>
                  </TableCell>
                  <TableCell>{currencyFormatter.format(deal.value)}</TableCell>
                  <TableCell>{deal.closeDate || '—'}</TableCell>
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
              {(!deals || deals.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No deals found yet. Add your first opportunity to get started.
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
            <SheetTitle>Create a New Deal</SheetTitle>
            <SheetDescription>
              Fill out the form to add a new deal.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateDeal} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact
              </Label>
              <Input id="contact" name="contact" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value ($)
              </Label>
              <Input id="value" name="value" type="number" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stage" className="text-right">
                Stage
              </Label>
              <Select name="stage" defaultValue="Prospecting">
                <SelectTrigger id="stage" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospecting">Prospecting</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closed-Won">Closed-Won</SelectItem>
                  <SelectItem value="Closed-Lost">Closed-Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="closeDate" className="text-right">
                Close Date
              </Label>
              <Input id="closeDate" name="closeDate" type="date" className="col-span-3" />
            </div>
            <SheetFooter>
              <Button type="submit">Save Deal</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
