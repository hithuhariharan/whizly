'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhizlyLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useAuth, useFirestore, useUser, setDocumentNonBlocking, doc } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDoc, writeBatch } from 'firebase/firestore';


export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as HTMLFormElement).name.value;
    const email = (e.currentTarget as HTMLFormElement).email.value;
    const password = (e.currentTarget as HTMLFormElement).password.value;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const batch = writeBatch(firestore);
      
      const tenantRef = doc(collection(firestore, 'tenants'));
      batch.set(tenantRef, {
        id: tenantRef.id,
        name: `${name}'s Organization`,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      const userDocRef = doc(firestore, "users", user.uid);
      batch.set(userDocRef, {
        id: user.uid,
        email: user.email,
        role: "Admin", // First user is always Admin
        name: name,
        tenantId: tenantRef.id,
      });

      await batch.commit();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: error.message,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(firestore, "users", user.uid);
        
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
            const batch = writeBatch(firestore);
            
            const tenantRef = doc(collection(firestore, 'tenants'));
            batch.set(tenantRef, {
              id: tenantRef.id,
              name: `${user.displayName}'s Organization`,
              ownerId: user.uid,
              createdAt: new Date().toISOString(),
            });

            batch.set(userDocRef, {
                id: user.uid,
                email: user.email,
                role: "Admin",
                name: user.displayName,
                tenantId: tenantRef.id,
            });
            
            await batch.commit();
        }
    } catch (error: any) {
        if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
           toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.message,
          });
        }
    }
  };
  
  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <div className="inline-block mx-auto">
          <WhizlyLogo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Enter your information to create an account with Whizly AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Create an account
          </Button>
        </form>
        <Separator className="my-4" />
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" >
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.356-11.139-7.917l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.533,44,30.169,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
          Sign up with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

    