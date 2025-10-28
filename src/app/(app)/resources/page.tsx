'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, FileText, UploadCloud, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Brochure = {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
};

const mockBrochures: Brochure[] = [
  { id: '1', name: 'Product Catalog 2024.pdf', size: '2.5 MB', uploadDate: '2023-10-27' },
  { id: '2', name: 'Service Tiers & Pricing.pdf', size: '800 KB', uploadDate: '2023-10-25' },
  { id: '3', name: 'Case Study - Acme Inc.pdf', size: '1.2 MB', uploadDate: '2023-10-22' },
  { id: '4', name: 'Onboarding Guide for New Clients.docx', size: '550 KB', uploadDate: '2023-10-20' },
];

export default function ResourceLibraryPage() {
  const { toast } = useToast();
  const [brochures, setBrochures] = useState<Brochure[]>(mockBrochures);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newBrochure: Brochure = {
        id: (brochures.length + 1).toString(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setBrochures([newBrochure, ...brochures]);
      toast({
        title: 'File Uploaded',
        description: `${file.name} has been added to the library.`,
      });
    }
  };

  const handleDelete = (brochureId: string) => {
    setBrochures(brochures.filter(b => b.id !== brochureId));
    toast({
      variant: 'destructive',
      title: 'File Deleted',
      description: 'The selected brochure has been removed.',
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Resource Library</h1>
        <div className="relative">
          <Button asChild>
            <label htmlFor="file-upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Brochure
            </label>
          </Button>
          <Input 
            id="file-upload" 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.png,.jpg"
          />
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Brochures</CardTitle>
          <CardDescription>
            A central place for all your sales and marketing materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brochures.map((brochure) => (
                <TableRow key={brochure.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{brochure.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{brochure.size}</TableCell>
                  <TableCell>{brochure.uploadDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(brochure.id)} className="text-destructive">
                          Delete
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
