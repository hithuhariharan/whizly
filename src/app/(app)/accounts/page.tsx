
'use client';

import { DollarSign, IndianRupee, Users, FileWarning } from 'lucide-react';
import {
  Card,
  CardContent,
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


type Sale = Invoice & { soldBy: string; soldByAvatar: string };

const mockSales: Sale[] = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: 2500, status: 'Paid', issueDate: '2023-10-15', dueDate: '2023-11-15', soldBy: 'John Doe', soldByAvatar: 'https://picsum.photos/seed/avatar1/40/40' },
  { id: 'INV-002', customer: 'Innovate LLC', amount: 1500, status: 'Pending', issueDate: '2023-10-20', dueDate: '2023-11-20', soldBy: 'Jane Smith', soldByAvatar: 'https://picsum.photos/seed/avatar2/40/40' },
  { id: 'INV-003', customer: 'Solutions Co.', amount: 3500, status: 'Paid', issueDate: '2023-10-25', dueDate: '2023-11-25', soldBy: 'John Doe', soldByAvatar: 'https://picsum.photos/seed/avatar1/40/40' },
  { id: 'INV-004', customer: 'Tech Gadgets', amount: 500, status: 'Overdue', issueDate: '2023-09-01', dueDate: '2023-10-01', soldBy: 'Peter Jones', soldByAvatar: 'https://picsum.photos/seed/avatar3/40/40' },
  { id: 'INV-005', customer: 'Marketing Pros', amount: 4200, status: 'Pending', issueDate: '2023-11-01', dueDate: '2023-12-01', soldBy: 'Jane Smith', soldByAvatar: 'https://picsum.photos/seed/avatar2/40/40' },
];

const statusStyles = {
  Paid: 'outline',
  Pending: 'secondary',
  Overdue: 'destructive',
  Draft: 'default',
} as const;

export default function AccountsPage() {
    const totalRevenue = mockSales.filter(s => s.status === 'Paid').reduce((acc, sale) => acc + sale.amount, 0);
    const paidInvoices = mockSales.filter(s => s.status === 'Paid').length;
    const overdueInvoices = mockSales.filter(s => s.status === 'Overdue').length;


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Accounting Dashboard</h1>
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
              Based on all paid invoices
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
            A record of all invoices created.
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
              {mockSales.map((sale) => (
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

