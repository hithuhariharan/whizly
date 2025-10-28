'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal, Phone } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useTenantProfile } from '@/hooks/use-tenant';

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString();
}

export default function ContactsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { tenantId, user, isTenantLoading } = useTenantProfile();

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'crmContacts'),
      where('tenantId', '==', tenantId),
      orderBy('lastContacted', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: contacts, isLoading: areContactsLoading } = useCollection<Contact>(contactsQuery);

  const handleCreateContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firestore || !tenantId || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot create contact',
        description: 'You must be signed in to create contacts.',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString();

    const promise = addDocumentNonBlocking(collection(firestore, 'crmContacts'), {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      lastContacted: now,
      tenantId,
      createdBy: user.uid,
      createdByName: user.displayName || user.email || 'Unknown user',
    });

    promise?.then((docRef) => {
      if (!docRef) {
        toast({
          variant: 'destructive',
          title: 'Failed to create contact',
          description: 'We could not save this contact. Please try again.',
        });
        return;
      }

      toast({
        title: 'Contact added',
        description: 'A new contact has been added to your CRM.',
      });
    });

    e.currentTarget.reset();
    setIsSheetOpen(false);
  };

  const handleCall = (contactName: string, phoneNumber: string) => {
    toast({
      title: `Calling ${contactName}...`,
      description: `Initiating call to ${phoneNumber} via MyOperator.`,
    });
  };

  if (isTenantLoading || areContactsLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Contacts...</h1>
        </div>
      </main>
    );
  }

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
              {contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{contact.phone || '—'}</span>
                      {contact.phone && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCall(contact.name, contact.phone!)}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="sr-only">Call contact</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.company || '—'}</TableCell>
                  <TableCell>{formatDate(contact.lastContacted)}</TableCell>
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
              {(!contacts || contacts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No contacts found yet. Add your first contact to get started.
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
