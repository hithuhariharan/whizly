'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';


export default function CreateInvoicePage() {

    // Mock data for clients
    const mockClients = [
        { id: '1', name: 'Acme Inc.' },
        { id: '2', name: 'Innovate LLC' },
        { id: '3', name: 'Solutions Co.' },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="max-w-4xl mx-auto grid w-full gap-2">
                <h1 className="text-3xl font-semibold">Create Invoice</h1>
            </div>

            <div className="max-w-4xl mx-auto grid w-full gap-6">
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
                            <Label>Invoice Items</Label>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[120px]">Price</TableHead>
                                        <TableHead className="w-[120px] text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Input placeholder="Item description" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" placeholder="1" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" placeholder="0.00" />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">$0.00</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                             <Button variant="outline" size="sm" className="mt-2">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" placeholder="Any additional notes for the client..." />
                            </div>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>$0.00</span>
                               </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">GST (18%)</span>
                                    <span>$0.00</span>
                               </div>
                                <div className="flex justify-between items-center font-semibold text-lg">
                                    <span>Total</span>
                                    <span>$0.00</span>
                               </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">Save as Draft</Button>
                        <Button>Save and Send</Button>
                    </CardFooter>
                 </Card>
            </div>
        </main>
    )
}
