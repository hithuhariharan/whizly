'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  tenantId: string;
};

export default function TeamPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: currentUserProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !currentUserProfile?.tenantId) return null;
    return query(collection(firestore, 'users'), where('tenantId', '==', currentUserProfile.tenantId));
  }, [firestore, currentUserProfile?.tenantId]);

  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    if (currentUserProfile && currentUserProfile.role !== 'Admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push('/dashboard');
    }
  }, [user, isUserLoading, currentUserProfile, isProfileLoading, router, toast]);

  const handleRoleChange = (userId: string, newRole: UserProfile['role']) => {
    if (user?.uid === userId) {
      toast({
        variant: 'destructive',
        title: 'Action Forbidden',
        description: 'You cannot change your own role.',
      });
      return;
    }
    const userToUpdateRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userToUpdateRef, { role: newRole });
    toast({
      title: 'Role Updated',
      description: `User role has been successfully changed to ${newRole}.`,
    });
  };

  const handleInviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!email || !role) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter an email and select a role.',
      });
      return;
    }

    // In a real app, you'd call a flow to generate an invite link and send an email.
    // For now, we'll just show a success message.
    console.log(`Inviting ${email} with role ${role}`);

    toast({
      title: 'Invitation Sent!',
      description: `An invitation has been sent to ${email}.`,
    });

    setIsSheetOpen(false);
  };

  if (isUserLoading || areUsersLoading || isProfileLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Team...</h1>
        </div>
      </main>
    );
  }

  if (currentUserProfile?.role !== 'Admin') {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have the necessary permissions to view this page. Please contact an administrator.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Team Management</h1>
        <div className="ml-auto">
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
          <CardDescription>View users and assign roles to manage access within your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || 'No Name'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user?.uid === u.id}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'Admin')}>
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'Manager')}>
                          Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(u.id, 'Employee')}>
                          Make Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>

    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invite a New User</SheetTitle>
            <SheetDescription>
              Send an invitation to a new user to join your organization.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleInviteUser} className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SheetFooter className="mt-4">
              <Button type="submit">Send Invitation</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
