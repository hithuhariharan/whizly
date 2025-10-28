'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, FileText, Check } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Invoice } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const mockInvoices: Invoice[] = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: 2500, amountPaid: 2500, status: 'Paid', issueDate: '2023-10-15', dueDate: '2023-11-15' },
  { id: 'INV-002', customer: 'Innovate LLC', amount: 1500, amountPaid: 750, status: 'Partially Paid', issueDate: '2023-10-20', dueDate: '2023-11-20' },
  { id: 'INV-003', customer: 'Solutions Co.', amount: 3500, amountPaid: 0, status: 'Draft', issueDate: '2023-10-25', dueDate: '2023-11-25' },
  { id: 'INV-004', customer: 'Tech Gadgets', amount: 500, amountPaid: 0, status: 'Overdue', issueDate: '2023-09-01', dueDate: '2023-10-01' },
];

const statusStyles = {
  Paid: 'outline',
  Pending: 'secondary',
  Overdue: 'destructive',
  Draft: 'default',
  'Partially Paid': 'secondary',
} as const;

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amount - invoice.amountPaid); // Default to remaining amount
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
      });
      return;
    }

    const newAmountPaid = selectedInvoice.amountPaid + paymentAmount;
    
    if (newAmountPaid > selectedInvoice.amount) {
        toast({
            variant: 'destructive',
            title: 'Overpayment Error',
            description: `Payment of ₹${paymentAmount} exceeds the balance of ₹${selectedInvoice.amount - selectedInvoice.amountPaid}.`,
        });
        return;
    }

    const newStatus: Invoice['status'] =
      newAmountPaid >= selectedInvoice.amount
        ? 'Paid'
        : 'Partially Paid';

    setInvoices(
      invoices.map((inv) =>
        inv.id === selectedInvoice.id
          ? { ...inv, amountPaid: newAmountPaid, status: newStatus }
          : inv
      )
    );

    toast({
      title: 'Payment Recorded',
      description: `₹${paymentAmount} recorded for invoice ${selectedInvoice.id}.`,
    });

    setIsPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <>
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
                  <TableHead>Amount / Paid</TableHead>
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
                    <TableCell>
                      <div className="flex flex-col">
                        <span>₹{invoice.amount.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-green-600">₹{invoice.amountPaid.toLocaleString('en-IN')} Paid</span>
                        <Progress value={(invoice.amountPaid / invoice.amount) * 100} className="h-1 mt-1" />
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openPaymentDialog(invoice)}>
                            Record Payment
                          </DropdownMenuItem>
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

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment for {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              Enter the amount received for this invoice. Balance due is ₹{(selectedInvoice?.amount || 0) - (selectedInvoice?.amountPaid || 0)}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>
              <Check className="mr-2 h-4 w-4" /> Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
