'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { addDays } from 'date-fns';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useTenantProfile } from '@/hooks/use-tenant';
import type { Invoice } from '@/lib/types';

const mockClients = [
    { id: '1', name: 'Acme Inc.', gstin: '29AABBCCDD12E1Z5', address: '123 Tech Park, Bangalore, KA' },
    { id: '2', name: 'Innovate LLC', gstin: '27AABBCCDD13F1Z5', address: '456 Innovation Hub, Mumbai, MH' },
    { id: '3', name: 'Solutions Co.', gstin: '36AABBCCDD14G1Z5', address: '789 Business Center, Hyderabad, TS' },
];

const gstSlabs = [0, 5, 12, 18, 28];
const tcsTdsOptions = [0, 0.1, 1, 2, 5, 10];

interface LineItem {
    id: number;
    description: string;
    quantity: number;
    price: number;
    gstRate: number;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
});

export default function CreateInvoicePage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { tenantId, user } = useTenantProfile();
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: 1, description: '', quantity: 1, price: 0, gstRate: 18 }
    ]);
    const [totals, setTotals] = useState({ subtotal: 0, gst: 0, withholdingTax: 0, grandTotal: 0, amountPaid: 0 });
    const [withholdingTaxType, setWithholdingTaxType] = useState('TCS');
    const [withholdingTaxRate, setWithholdingTaxRate] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [notes, setNotes] = useState('');
    const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 7));

    const selectedClient = useMemo(() => mockClients.find((client) => client.id === selectedClientId) ?? null, [selectedClientId]);

    const [companyProfile] = useState({
        companyName: "Whizly AI Solutions",
        gstin: "29AABCU9603R1ZM",
        pan: "AABCU9603R",
        billingAddress: "123 Whizly Avenue, Tech City, Karnataka, 560001",
        logo: "https://picsum.photos/seed/logo/150/50"
    });

    useEffect(() => {
        let subtotal = 0;
        let gst = 0;

        lineItems.forEach(item => {
            const itemTotal = item.quantity * item.price;
            subtotal += itemTotal;
            gst += itemTotal * (item.gstRate / 100);
        });

        const withholdingTaxAmount = subtotal * (withholdingTaxRate / 100);
        const grandTotal = subtotal + gst + withholdingTaxAmount;

        setTotals({ subtotal, gst, withholdingTax: withholdingTaxAmount, grandTotal, amountPaid });
    }, [lineItems, withholdingTaxRate, amountPaid]);

    const addLineItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, price: 0, gstRate: 18 }]);
    };

    const removeLineItem = (id: number) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setLineItems(lineItems.map(item => {
            if (item.id === id) {
                if (field === 'quantity' || field === 'price' || field === 'gstRate') {
                    return { ...item, [field]: Number(value) || 0 };
                }
                if (field === 'description') {
                    return { ...item, description: String(value) };
                }
            }
            return item;
        }));
    };

    const buildInvoiceRecord = (statusOverride?: Invoice['status']) => {
        if (!tenantId || !firestore || !user) {
            toast({
                variant: 'destructive',
                title: 'Cannot save invoice',
                description: 'Please ensure you are signed in and try again.',
            });
            return null;
        }

        if (!selectedClient) {
            toast({
                variant: 'destructive',
                title: 'Missing client',
                description: 'Please select a client for this invoice.',
            });
            return null;
        }

        if (!issueDate || !dueDate) {
            toast({
                variant: 'destructive',
                title: 'Missing dates',
                description: 'Please select both issue and due dates.',
            });
            return null;
        }

        const amount = totals.grandTotal;
        const computedStatus: Invoice['status'] = statusOverride
            ? statusOverride
            : amountPaid >= amount
                ? 'Paid'
                : amountPaid > 0
                    ? 'Partially Paid'
                    : 'Pending';

        return {
            customer: selectedClient.name,
            customerId: selectedClient.id,
            amount,
            amountPaid,
            status: computedStatus,
            issueDate: issueDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            tenantId,
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
            createdByName: user.displayName || user.email || 'Unknown user',
            invoiceNumber: `INV-${Date.now()}`,
            notes,
            currency: 'INR',
            lineItems: lineItems.map(item => ({
                id: String(item.id),
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                gstRate: item.gstRate,
            })),
            subtotal: totals.subtotal,
            gstTotal: totals.gst,
            withholdingTax: totals.withholdingTax,
            withholdingTaxType,
            withholdingTaxRate,
        } satisfies Omit<Invoice, 'id'>;
    };

    const saveInvoice = async (statusOverride?: Invoice['status']) => {
        const record = buildInvoiceRecord(statusOverride);
        if (!record) return null;

        const docRef = await addDocumentNonBlocking(collection(firestore, 'invoices'), record);
        if (!docRef) {
            toast({
                variant: 'destructive',
                title: 'Failed to save invoice',
                description: 'We could not save this invoice. Please try again.',
            });
            return null;
        }

        const invoiceRecord: Invoice = {
            id: docRef.id,
            ...record,
        };

        toast({
            title: 'Invoice Saved',
            description: `Invoice ${invoiceRecord.invoiceNumber} has been saved successfully.`,
        });

        return invoiceRecord;
    };

    const generatePdf = (invoice: Invoice) => {
        const tempElement = document.createElement('div');
        tempElement.className = "p-8 bg-white text-black absolute -z-10 -left-[9999px]";
        tempElement.innerHTML = `
      <div class="w-[210mm] h-[297mm] p-8 box-border flex flex-col">
        <header class="flex justify-between items-start pb-4 border-b">
            <div>
                <img src="${companyProfile.logo}" alt="Company Logo" class="h-16" />
                <h1 class="text-2xl font-bold mt-2">${companyProfile.companyName}</h1>
                <p class="text-xs">${companyProfile.billingAddress}</p>
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
                <p>${selectedClient?.address ?? ''}</p>
                <p><strong>GSTIN:</strong> ${selectedClient?.gstin ?? ''}</p>
            </div>
            <div class="text-right">
                <h3 class="font-bold">Bill From:</h3>
                <p>${companyProfile.companyName}</p>
                <p>${companyProfile.billingAddress}</p>
                <p><strong>GSTIN:</strong> ${companyProfile.gstin}</p>
                <p><strong>PAN:</strong> ${companyProfile.pan}</p>
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
                ${(invoice.lineItems ?? []).map(item => `
                  <tr>
                    <td class="p-2">${item.description}</td>
                    <td class="p-2">${item.quantity}</td>
                    <td class="p-2">${currencyFormatter.format(item.price)}</td>
                    <td class="p-2">${item.gstRate}%</td>
                    <td class="p-2 text-right">${currencyFormatter.format(item.quantity * item.price)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
         </section>
        <section class="flex justify-end mt-8">
            <div class="w-1/2 space-y-2">
                 <div class="flex justify-between"><span class="text-muted-foreground">Subtotal:</span> ${currencyFormatter.format(invoice.subtotal ?? 0)}</div>
                 <div class="flex justify-between"><span class="text-muted-foreground">GST:</span> ${currencyFormatter.format(invoice.gstTotal ?? 0)}</div>
                 <div class="flex justify-between"><span class="text-muted-foreground">${invoice.withholdingTaxType ?? withholdingTaxType} (${invoice.withholdingTaxRate ?? withholdingTaxRate}%):</span> ${currencyFormatter.format(invoice.withholdingTax ?? 0)}</div>
                 <div class="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span >Grand Total:</span> ${currencyFormatter.format(invoice.amount)}</div>
                 <div class="flex justify-between text-green-600"><span >Amount Paid:</span> - ${currencyFormatter.format(invoice.amountPaid)}</div>
                 <div class="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span >Balance Due:</span> ${currencyFormatter.format(invoice.amount - invoice.amountPaid)}</div>
            </div>
        </section>
         <footer class="mt-auto text-center text-xs text-muted-foreground pt-8">
            <p>Thank you for your business!</p>
        </footer>
      </div>
    `;
        document.body.appendChild(tempElement);

        html2canvas(tempElement, { scale: 2 }).then(canvas => {
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

    const handleSaveDraft = async () => {
        await saveInvoice('Draft');
    };

    const handleSaveAndDownload = async () => {
        const invoice = await saveInvoice();
        if (!invoice) return;
        generatePdf(invoice);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-5xl mx-auto grid w-full gap-2">
                <h1 className="text-3xl font-semibold">Create Invoice</h1>
            </div>

            <div className="max-w-5xl mx-auto grid w-full gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>New Invoice Details</CardTitle>
                        <CardDescription>Fill out the details below to create a new invoice.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                    <SelectTrigger id="client">
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockClients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="issue-date">Issue Date</Label>
                                <DatePicker value={issueDate} onChange={setIssueDate} id="issue-date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due-date">Due Date</Label>
                                <DatePicker value={dueDate} onChange={setDueDate} id="due-date" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-lg font-medium">Invoice Items</Label>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">Description</TableHead>
                                        <TableHead className="w-[120px]">Qty</TableHead>
                                        <TableHead className="w-[150px]">Price</TableHead>
                                        <TableHead className="w-[120px]">GST (%)</TableHead>
                                        <TableHead className="w-[150px] text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Input placeholder="Item description" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={String(item.gstRate)} onValueChange={(value) => handleItemChange(item.id, 'gstRate', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {gstSlabs.map(rate => <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{currencyFormatter.format(item.quantity * item.price)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="amount-paid">Amount Paid</Label>
                                  <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value) || 0)} placeholder="Enter amount already paid" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" placeholder="Any additional notes for the client..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{currencyFormatter.format(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">GST Total</span>
                                    <span>{currencyFormatter.format(totals.gst)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Select value={withholdingTaxType} onValueChange={setWithholdingTaxType}>
                                            <SelectTrigger className="w-[80px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TCS">TCS</SelectItem>
                                                <SelectItem value="TDS">TDS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Select value={String(withholdingTaxRate)} onValueChange={(value) => setWithholdingTaxRate(Number(value))}>
                                            <SelectTrigger id="tcs-rate">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tcsTdsOptions.map(rate => <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <span>{currencyFormatter.format(totals.withholdingTax)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
                                    <span>Grand Total</span>
                                    <span>{currencyFormatter.format(totals.grandTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-600">
                                    <span>Amount Paid</span>
                                    <span>- {currencyFormatter.format(totals.amountPaid)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-xl border-t pt-2 mt-2">
                                    <span>Balance Due</span>
                                    <span>{currencyFormatter.format(totals.grandTotal - totals.amountPaid)}</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleSaveDraft}>Save as Draft</Button>
                        <Button onClick={handleSaveAndDownload}>Save, Send & Download PDF</Button>
                    </CardFooter>
                </Card>
            </div>
            <div id="invoice-preview" className="p-8 bg-white text-black absolute -z-10 -left-[9999px]" />
        </main>
    )
}
