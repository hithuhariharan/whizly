'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
};

export default function TeamPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: currentUserProfile } = useDoc<{ role: string }>(userDocRef);

  const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    if (!isUserLoading && currentUserProfile && currentUserProfile.role !== 'Admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push('/dashboard');
    }
  }, [isUserLoading, currentUserProfile, router, toast]);
  
  const handleRoleChange = (userId: string, newRole: UserProfile['role']) => {
    const userToUpdateRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userToUpdateRef, { role: newRole });
    toast({
        title: 'Role Updated',
        description: `User role has been successfully changed to ${newRole}.`,
    });
  };

  if (isUserLoading || areUsersLoading || !currentUserProfile || currentUserProfile.role !== 'Admin') {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Team...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Team Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
          <CardDescription>View users and assign roles to manage access.</CardDescription>
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
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
  );
}
