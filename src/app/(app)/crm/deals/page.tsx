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

const mockDeals: Deal[] = [
  { id: '1', name: 'Website Redesign', contact: 'Olivia Martin', stage: 'Proposal', value: 5000, closeDate: '2023-11-30' },
  { id: '2', name: 'Mobile App Development', contact: 'Jackson Lee', stage: 'Negotiation', value: 25000, closeDate: '2023-12-15' },
  { id: '3', name: 'SEO Optimization', contact: 'Sophia Hernandez', stage: 'Closed-Won', value: 2000, closeDate: '2023-10-20' },
  { id: '4', name: 'E-commerce Platform', contact: 'Liam Garcia', stage: 'Prospecting', value: 15000, closeDate: '2024-01-10' },
  { id: '5', name: 'Social Media Campaign', contact: 'Ava Rodriguez', stage: 'Closed-Lost', value: 3000, closeDate: '2023-10-15' },
];

const stageStyles = {
  Prospecting: 'default',
  Proposal: 'secondary',
  Negotiation: 'secondary',
  'Closed-Won': 'outline',
  'Closed-Lost': 'destructive',
} as const;

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDeal: Deal = {
      id: (deals.length + 1).toString(),
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      stage: 'Prospecting',
      value: Number(formData.get('value')),
      closeDate: formData.get('closeDate') as string,
    };
    setDeals([newDeal, ...deals]);
    setIsSheetOpen(false);
  };

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
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.contact}</TableCell>
                  <TableCell>
                    <Badge variant={stageStyles[deal.stage]}>{deal.stage}</Badge>
                  </TableCell>
                  <TableCell>${deal.value.toLocaleString()}</TableCell>
                  <TableCell>{deal.closeDate}</TableCell>
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
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
