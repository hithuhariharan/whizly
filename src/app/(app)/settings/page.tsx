
'use client';

import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenantProfile } from '@/hooks/use-tenant';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

const companyProfileSchema = z.object({
  companyName: z.string().optional(),
  legalEntityType: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  cin: z.string().optional(),
  billingAddress: z.string().optional(),
  branchAddress: z.string().optional(),
  placeOfSupply: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  defaultCurrency: z.enum(['INR', 'USD']).optional(),
  defaultTaxRegime: z.enum(['Regular', 'Composition']).optional(),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;


export default function SettingsPage() {
  const { user, isTenantLoading, tenantId } = useTenantProfile();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        displayName: user?.displayName || '',
        email: user?.email || ''
    }
  });

  const companyForm = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
  });

  const companyProfileDocRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return doc(firestore, 'companyProfiles', tenantId);
  }, [firestore, tenantId]);

  const { data: companyProfileData } = useDoc<CompanyProfileFormValues>(companyProfileDocRef);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (companyProfileData) {
      companyForm.reset(companyProfileData);
    }
  }, [companyProfileData, companyForm]);


  async function onProfileSubmit(data: ProfileFormValues) {
    if (!auth.currentUser) return;
    
    try {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
        // Assuming user profile data is stored in a 'userProfiles' collection
        const userDocRef = doc(firestore, 'userProfiles', auth.currentUser.uid);
        updateDocumentNonBlocking(userDocRef, { displayName: data.displayName });
        toast({
          title: "Profile Updated",
          description: "Your settings have been saved.",
        })
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Error updating profile",
            description: error.message,
        })
    }
  }

  function onCompanyProfileSubmit(data: CompanyProfileFormValues) {
    if (!companyProfileDocRef) {
      toast({
        variant: 'destructive',
        title: 'Unable to save company profile',
        description: 'Please try again after refreshing the page.',
      });
      return;
    }

    setDocumentNonBlocking(companyProfileDocRef, data, { merge: true });
    toast({
      title: "Company Profile Saved",
      description: "Your company details have been updated.",
    });
  }

  if (isTenantLoading) {
      return (
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <h1 className="font-semibold text-lg md:text-2xl">Loading Settings...</h1>
          </main>
      )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
       <Tabs defaultValue="profile" className="grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <TabsList className="grid-cols-1 text-sm text-muted-foreground h-auto bg-transparent p-0">
          <TabsTrigger value="profile" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">
            Your Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">
            Company Profile
          </TabsTrigger>
        </TabsList>
        <div className="grid gap-6">
           <TabsContent value="profile">
             <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your personal account details here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormDescription>This is your public display name.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" {...field} readOnly disabled />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
           </TabsContent>
           <TabsContent value="company">
             <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Manage your organization's details for invoicing and compliance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <Form {...companyForm}>
                    <form onSubmit={companyForm.handleSubmit(onCompanyProfileSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={companyForm.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Your Company Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="legalEntityType" render={({ field }) => (<FormItem><FormLabel>Legal Entity Type</FormLabel><FormControl><Input placeholder="e.g., Private Limited" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FormField control={companyForm.control} name="gstin" render={({ field }) => (<FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input placeholder="29ABCDE1234F1Z5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="pan" render={({ field }) => (<FormItem><FormLabel>PAN</FormLabel><FormControl><Input placeholder="ABCDE1234F" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={companyForm.control} name="cin" render={({ field }) => (<FormItem><FormLabel>CIN</FormLabel><FormControl><Input placeholder="L12345MH2023PLC123456" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={companyForm.control} name="billingAddress" render={({ field }) => (<FormItem><FormLabel>Billing Address</FormLabel><FormControl><Textarea placeholder="123 Main Street..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={companyForm.control} name="branchAddress" render={({ field }) => (<FormItem><FormLabel>Branch Address (Optional)</FormLabel><FormControl><Textarea placeholder="456 Side Street..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <CardTitle className="text-lg pt-4">Bank & Tax Details</CardTitle>

                         <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={companyForm.control} name="placeOfSupply" render={({ field }) => (<FormItem><FormLabel>Place of Supply (State)</FormLabel><FormControl><Input placeholder="e.g., Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="defaultCurrency" render={({ field }) => (<FormItem><FormLabel>Default Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl><SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Your bank account number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="ifscCode" render={({ field }) => (<FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="HDFC0001234" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={companyForm.control} name="upiId" render={({ field }) => (<FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input placeholder="yourcompany@upi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         </div>

                        <CardTitle className="text-lg pt-4">Branding</CardTitle>
                        <div className="space-y-2">
                            <Label>Company Logo</Label>
                            <Input type="file" />
                            <FormDescription>Upload your company logo. This will be embedded in your invoices.</FormDescription>
                        </div>
                         <div className="space-y-2">
                            <Label>Signature / Stamp Image</Label>
                            <Input type="file" />
                            <FormDescription>Optional: Upload an image of your signature or company stamp.</FormDescription>
                        </div>

                      <Button type="submit" disabled={companyForm.formState.isSubmitting}>Save Company Profile</Button>
                    </form>
                   </Form>
                </CardContent>
             </Card>
           </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
