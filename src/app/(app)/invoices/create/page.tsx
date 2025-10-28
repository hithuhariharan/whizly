

'use client';

import { useState, useEffect } from 'react';
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

// Mock data for clients
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

export default function CreateInvoicePage() {
    const { toast } = useToast();
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: 1, description: '', quantity: 1, price: 0, gstRate: 18 }
    ]);
    const [totals, setTotals] = useState({ subtotal: 0, gst: 0, withholdingTax: 0, grandTotal: 0, amountPaid: 0 });
    const [withholdingTaxType, setWithholdingTaxType] = useState('TCS');
    const [withholdingTaxRate, setWithholdingTaxRate] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    
    // Mock company profile
    const [companyProfile, setCompanyProfile] = useState({
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
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const generatePdf = () => {
        const invoiceElement = document.getElementById('invoice-preview');
        if (!invoiceElement) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not find invoice element to generate PDF.' });
            return;
        };

        html2canvas(invoiceElement, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${new Date().toISOString().split('T')[0]}.pdf`);
             toast({ title: 'PDF Generated', description: 'Your invoice has been downloaded.' });
        });
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
                                <Select>
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
                                <DatePicker />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due-date">Due Date</Label>
                                <DatePicker />
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
                                            <TableCell className="text-right font-medium">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
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
                                    <Textarea id="notes" placeholder="Any additional notes for the client..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">GST Total</span>
                                    <span>₹{totals.gst.toFixed(2)}</span>
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
                                        <span>₹{totals.withholdingTax.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
                                    <span>Grand Total</span>
                                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-600">
                                    <span>Amount Paid</span>
                                    <span>- ₹{totals.amountPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-xl border-t pt-2 mt-2">
                                    <span>Balance Due</span>
                                    <span>₹{(totals.grandTotal - totals.amountPaid).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">Save as Draft</Button>
                        <Button onClick={generatePdf}>Save, Send & Download PDF</Button>
                    </CardFooter>
                </Card>
            </div>
            {/* Hidden printable invoice */}
            <div id="invoice-preview" className="p-8 bg-white text-black absolute -z-10 -left-[9999px]">
                <div className="w-[210mm] h-[297mm] p-8 box-border flex flex-col">
                    <header className="flex justify-between items-start pb-4 border-b">
                        <div>
                            <img src={companyProfile.logo} alt="Company Logo" className="h-16" />
                            <h1 className="text-2xl font-bold mt-2">{companyProfile.companyName}</h1>
                            <p className="text-xs">{companyProfile.billingAddress}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-bold uppercase">Invoice</h2>
                            <p className="mt-1"><strong>Invoice #:</strong> INV-001</p>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                    </header>
                    <section className="flex justify-between mt-8">
                         <div>
                            <h3 className="font-bold">Bill To:</h3>
                            <p>{mockClients[0].name}</p>
                            <p>{mockClients[0].address}</p>
                            <p><strong>GSTIN:</strong> {mockClients[0].gstin}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold">Bill From:</h3>
                            <p>{companyProfile.companyName}</p>
                            <p>{companyProfile.billingAddress}</p>
                            <p><strong>GSTIN:</strong> {companyProfile.gstin}</p>
                            <p><strong>PAN:</strong> {companyProfile.pan}</p>
                        </div>
                    </section>
                     <section className="mt-8">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted-foreground/10">
                                    <TableHead>Item</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>GST</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                        <TableCell>{item.gstRate}%</TableCell>
                                        <TableCell className="text-right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </section>
                    <section className="flex justify-end mt-8">
                        <div className="w-1/2 space-y-2">
                             <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> ₹{totals.subtotal.toFixed(2)}</div>
                             <div className="flex justify-between"><span className="text-muted-foreground">GST:</span> ₹{totals.gst.toFixed(2)}</div>
                             <div className="flex justify-between"><span className="text-muted-foreground">{withholdingTaxType} ({withholdingTaxRate}%):</span> ₹{totals.withholdingTax.toFixed(2)}</div>
                             <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span >Grand Total:</span> ₹{totals.grandTotal.toFixed(2)}</div>
                             <div className="flex justify-between text-green-600"><span >Amount Paid:</span> - ₹{totals.amountPaid.toFixed(2)}</div>
                             <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span >Balance Due:</span> ₹{(totals.grandTotal - totals.amountPaid).toFixed(2)}</div>
                        </div>
                    </section>
                     <footer className="mt-auto text-center text-xs text-muted-foreground pt-8">
                        <p>Thank you for your business!</p>
                    </footer>
                </div>
            </div>
        </main>
    )
}
