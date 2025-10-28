'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, FileText } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Invoice } from '@/lib/types';

const mockInvoices: Invoice[] = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: 2500, status: 'Paid', issueDate: '2023-10-15', dueDate: '2023-11-15' },
  { id: 'INV-002', customer: 'Innovate LLC', amount: 1500, status: 'Pending', issueDate: '2023-10-20', dueDate: '2023-11-20' },
  { id: 'INV-003', customer: 'Solutions Co.', amount: 3500, status: 'Draft', issueDate: '2023-10-25', dueDate: '2023-11-25' },
  { id: 'INV-004', customer: 'Tech Gadgets', amount: 500, status: 'Overdue', issueDate: '2023-09-01', dueDate: '2023-10-01' },
];

const statusStyles = {
  Paid: 'outline',
  Pending: 'secondary',
  Overdue: 'destructive',
  Draft: 'default',
} as const;


export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Invoices</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/invoices/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Invoice
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Your Invoices</CardTitle>
          <CardDescription>
            Here&apos;s a list of all invoices for your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[invoice.status]}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
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
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
