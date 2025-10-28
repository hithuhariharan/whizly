
'use client';

import { DollarSign, IndianRupee, Users, FileWarning, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Invoice } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';


type Sale = Invoice & { soldBy: string; soldByAvatar: string };

const mockSales: Sale[] = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: 2500, status: 'Paid', issueDate: '2023-10-15', dueDate: '2023-11-15', soldBy: 'John Doe', soldByAvatar: 'https://picsum.photos/seed/avatar1/40/40', amountPaid: 2500 },
  { id: 'INV-002', customer: 'Innovate LLC', amount: 1500, status: 'Partially Paid', issueDate: '2023-10-20', dueDate: '2023-11-20', soldBy: 'Jane Smith', soldByAvatar: 'https://picsum.photos/seed/avatar2/40/40', amountPaid: 750 },
  { id: 'INV-003', customer: 'Solutions Co.', amount: 3500, status: 'Paid', issueDate: '2023-11-05', dueDate: '2023-12-05', soldBy: 'John Doe', soldByAvatar: 'https://picsum.photos/seed/avatar1/40/40', amountPaid: 3500 },
  { id: 'INV-004', customer: 'Tech Gadgets', amount: 500, status: 'Overdue', issueDate: '2023-09-01', dueDate: '2023-10-01', soldBy: 'Peter Jones', soldByAvatar: 'https://picsum.photos/seed/avatar3/40/40', amountPaid: 0 },
  { id: 'INV-005', customer: 'Marketing Pros', amount: 4200, status: 'Pending', issueDate: '2023-11-01', dueDate: '2023-12-01', soldBy: 'Jane Smith', soldByAvatar: 'https://picsum.photos/seed/avatar2/40/40', amountPaid: 0 },
];

const statusStyles = {
  Paid: 'outline',
  Pending: 'secondary',
  Overdue: 'destructive',
  Draft: 'default',
  'Partially Paid': 'secondary',
} as const;

export default function AccountsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const filteredSales = mockSales.filter(sale => {
        if (!date?.from) return true; // Show all if no start date
        const issueDate = new Date(sale.issueDate);
        // If there's no 'to' date, filter from 'from' date to now
        const toDate = date.to ? date.to : new Date();
        return issueDate >= date.from && issueDate <= toDate;
    });

    const totalRevenue = filteredSales.filter(s => s.status === 'Paid' || s.status === 'Partially Paid').reduce((acc, sale) => acc + sale.amountPaid, 0);
    const paidInvoices = filteredSales.filter(s => s.status === 'Paid').length;
    const overdueInvoices = filteredSales.filter(s => s.status === 'Overdue').length;

    const exportToCSV = () => {
        const headers = ['Invoice #', 'Customer', 'Amount', 'Amount Paid', 'Status', 'Sold By', 'Issue Date'];
        const rows = filteredSales.map(sale => 
            [sale.id, sale.customer, sale.amount, sale.amountPaid, sale.status, sale.soldBy, sale.issueDate].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_ledger.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Accounting Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
            <DateRangePicker onDateChange={setDate} />
            <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Based on filtered invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Total number of fully paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment past due date
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sales Ledger</CardTitle>
          <CardDescription>
            A record of all invoices created within the selected date range.
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
                <TableHead>Sold By</TableHead>
                <TableHead>Issue Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>₹{sale.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[sale.status]}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={sale.soldByAvatar} alt={sale.soldBy} data-ai-hint="person avatar" />
                              <AvatarFallback>{sale.soldBy.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{sale.soldBy}</span>
                      </div>
                  </TableCell>
                  <TableCell>{sale.issueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
