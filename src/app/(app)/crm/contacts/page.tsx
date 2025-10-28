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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Contact } from '@/lib/types';

const mockContacts: Contact[] = [
  { id: '1', name: 'Olivia Martin', email: 'olivia.martin@email.com', phone: '+1 (555) 123-4567', company: 'Acme Inc.', lastContacted: '2023-10-26' },
  { id: '2', name: 'Jackson Lee', email: 'jackson.lee@email.com', phone: '+1 (555) 987-6543', company: 'Innovate LLC', lastContacted: '2023-10-25' },
  { id: '3', name: 'Sophia Hernandez', email: 'sophia.h@email.com', phone: '+1 (555) 234-5678', company: 'Solutions Co.', lastContacted: '2023-10-24' },
  { id: '4', name: 'Liam Garcia', email: 'liam.g@email.com', phone: '+1 (555) 876-5432', company: 'Tech Gadgets', lastContacted: '2023-10-23' },
  { id: '5', name: 'Ava Rodriguez', email: 'ava.r@email.com', phone: '+1 (555) 345-6789', company: 'Marketing Pros', lastContacted: '2023-10-22' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContact: Contact = {
      id: (contacts.length + 1).toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      lastContacted: new Date().toISOString().split('T')[0],
    };
    setContacts([newContact, ...contacts]);
    setIsSheetOpen(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Contacts</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create Contact
            </span>
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Contacts</CardTitle>
          <CardDescription>
            A list of all contacts in your CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.lastContacted}</TableCell>
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
            <SheetTitle>Create a New Contact</SheetTitle>
            <SheetDescription>
              Fill out the form to add a new contact.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateContact} className="grid gap-4 py-4">
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
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" type="tel" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input id="company" name="company" className="col-span-3" />
            </div>
            <SheetFooter>
              <Button type="submit">Save Contact</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
