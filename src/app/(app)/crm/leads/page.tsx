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

import type { Lead } from '@/lib/types';

const mockLeads: Lead[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'New', assignedTo: 'John Doe', createdAt: '2023-10-26' },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', status: 'Contacted', assignedTo: 'Jane Smith', createdAt: '2023-10-25' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'Qualified', assignedTo: 'John Doe', createdAt: '2023-10-24' },
  { id: '4', name: 'Diana Miller', email: 'diana@example.com', status: 'Lost', assignedTo: 'Jane Smith', createdAt: '2023-10-23' },
  { id: '5', name: 'Ethan Davis', email: 'ethan@example.com', status: 'New', assignedTo: 'John Doe', createdAt: '2023-10-22' },
];

const statusStyles = {
  New: 'default',
  Contacted: 'secondary',
  Qualified: 'outline',
  Lost: 'destructive',
} as const;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLead: Lead = {
      id: (leads.length + 1).toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      status: 'New',
      assignedTo: 'Unassigned',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads([newLead, ...leads]);
    setIsSheetOpen(false);
  };

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
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[lead.status]}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>{lead.assignedTo}</TableCell>
                  <TableCell>{lead.createdAt}</TableCell>
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
              <Select name="assignedTo">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
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
