'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Check } from 'lucide-react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, orderBy, query, where } from 'firebase/firestore';
import { useTenantProfile } from '@/hooks/use-tenant';

const statusStyles = {
  Paid: 'outline',
  Pending: 'secondary',
  Overdue: 'destructive',
  Draft: 'default',
  'Partially Paid': 'secondary',
} as const;

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export default function InvoicesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { tenantId, isTenantLoading } = useTenantProfile();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'invoices'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: invoices, isLoading: areInvoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const selectedInvoice = useMemo(
    () => invoices?.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

  const openPaymentDialog = (invoiceId: string) => {
    if (!invoices) return;
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    setSelectedInvoiceId(invoice.id);
    setPaymentAmount(Math.max(invoice.amount - invoice.amountPaid, 0));
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Cannot record payment',
        description: 'Please try again after refreshing the page.',
      });
      return;
    }

    if (paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
      });
      return;
    }

    const newAmountPaid = selectedInvoice.amountPaid + paymentAmount;

    if (newAmountPaid > selectedInvoice.amount) {
      const remaining = selectedInvoice.amount - selectedInvoice.amountPaid;
      toast({
        variant: 'destructive',
        title: 'Overpayment Error',
        description: `Payment of ${currencyFormatter.format(paymentAmount)} exceeds the remaining balance of ${currencyFormatter.format(remaining)}.`,
      });
      return;
    }

    const newStatus: Invoice['status'] =
      newAmountPaid >= selectedInvoice.amount ? 'Paid' : 'Partially Paid';

    updateDocumentNonBlocking(doc(firestore, 'invoices', selectedInvoice.id), {
      amountPaid: newAmountPaid,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: 'Payment Recorded',
      description: `${currencyFormatter.format(paymentAmount)} recorded for invoice ${selectedInvoice.invoiceNumber ?? selectedInvoice.id}.`,
    });

    setIsPaymentDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  const generatePdf = (invoice: Invoice) => {
    const tempElement = document.createElement('div');
    tempElement.className = 'p-8 bg-white text-black absolute -z-10 -left-[9999px]';

    const lineItems = invoice.lineItems?.length
      ? invoice.lineItems
      : [
          {
            id: 'summary',
            description: 'Invoice total',
            quantity: 1,
            price: invoice.amount,
            gstRate: 0,
          },
        ];

    tempElement.innerHTML = `
      <div class="w-[210mm] h-[297mm] p-8 box-border flex flex-col">
        <header class="flex justify-between items-start pb-4 border-b">
            <div>
                <img src="https://picsum.photos/seed/logo/150/50" alt="Company Logo" class="h-16" />
                <h1 class="text-2xl font-bold mt-2">Whizly AI Solutions</h1>
                <p class="text-xs">123 Whizly Avenue, Tech City, Karnataka, 560001</p>
            </div>
            <div class="text-right">
                <h2 class="text-4xl font-bold uppercase">Invoice</h2>
                <p class="mt-1"><strong>Invoice #:</strong> ${invoice.invoiceNumber ?? invoice.id}</p>
                <p><strong>Date:</strong> ${invoice.issueDate}</p>
            </div>
        </header>
        <section class="flex justify-between mt-8">
             <div>
                <h3 class="font-bold">Bill To:</h3>
                <p>${invoice.customer}</p>
            </div>
        </section>
         <section class="mt-8">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="text-left p-2">Item</th>
                  <th class="text-left p-2">Qty</th>
                  <th class="text-left p-2">Rate</th>
                  <th class="text-left p-2">GST</th>
                  <th class="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems
                  .map(
                    (item) => `
                      <tr>
                        <td class="p-2">${item.description}</td>
                        <td class="p-2">${item.quantity}</td>
                        <td class="p-2">${currencyFormatter.format(item.price)}</td>
                        <td class="p-2">${item.gstRate}%</td>
                        <td class="p-2 text-right">${currencyFormatter.format(item.quantity * item.price)}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
         </section>
        <section class="flex justify-end mt-auto">
            <div class="w-1/2 space-y-2">
                 <div class="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Grand Total:</span> ${currencyFormatter.format(invoice.amount)}</div>
                 <div class="flex justify-between text-green-600"><span>Amount Paid:</span> - ${currencyFormatter.format(invoice.amountPaid)}</div>
                 <div class="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Balance Due:</span> ${currencyFormatter.format(invoice.amount - invoice.amountPaid)}</div>
            </div>
        </section>
         <footer class="mt-auto text-center text-xs text-gray-500 pt-8">
            <p>Thank you for your business!</p>
        </footer>
      </div>
    `;
    document.body.appendChild(tempElement);

    html2canvas(tempElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNumber ?? invoice.id}.pdf`);
      document.body.removeChild(tempElement);
      toast({ title: 'PDF Generated', description: 'Your invoice has been downloaded.' });
    });
  };

  if (isTenantLoading || areInvoicesLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Invoices...</h1>
        </div>
      </main>
    );
  }

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
                {invoices?.map((invoice) => {
                  const progress = invoice.amount > 0 ? (invoice.amountPaid / invoice.amount) * 100 : 0;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber ?? invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{currencyFormatter.format(invoice.amount)}</span>
                          <span className="text-sm text-green-600">{currencyFormatter.format(invoice.amountPaid)} Paid</span>
                          <Progress value={progress} className="h-1 mt-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusStyles[invoice.status]}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate || '—'}</TableCell>
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
                            <DropdownMenuItem disabled>View</DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={invoice.status === 'Paid'}
                              onClick={() => openPaymentDialog(invoice.id)}
                            >
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generatePdf(invoice)}>
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!invoices || invoices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No invoices found yet. Create your first invoice to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Record Payment for {selectedInvoice?.invoiceNumber ?? selectedInvoice?.id}
            </DialogTitle>
            <DialogDescription>
              Enter the amount received for this invoice. Balance due is {currencyFormatter.format(
                Math.max((selectedInvoice?.amount || 0) - (selectedInvoice?.amountPaid || 0), 0)
              )}.
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
