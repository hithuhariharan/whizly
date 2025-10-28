'use client';

import { useMemo, useState } from 'react';
import { IndianRupee, Users, FileWarning, Download } from 'lucide-react';
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
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useTenantProfile } from '@/hooks/use-tenant';
import { useToast } from '@/hooks/use-toast';

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

export default function AccountsPage() {
  const firestore = useFirestore();
  const { tenantId, isTenantLoading } = useTenantProfile();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'invoices'),
      where('tenantId', '==', tenantId),
      orderBy('issueDate', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: invoices, isLoading: areInvoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const sales = useMemo(() => {
    return (invoices ?? []).map((invoice) => ({
      ...invoice,
      displayIssueDate: invoice.issueDate,
      soldBy: invoice.createdByName ?? 'Team Member',
      soldByAvatar: `https://picsum.photos/seed/${invoice.createdBy ?? 'user'}/40/40`,
    }));
  }, [invoices]);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    if (!date?.from && !date?.to) return sales;

    return sales.filter((sale) => {
      if (!sale.displayIssueDate) return false;
      const issueDate = new Date(sale.displayIssueDate);
      if (Number.isNaN(issueDate.getTime())) return true;
      const startDate = date?.from ?? new Date(2020, 0, 1);
      const endDate = date?.to ?? new Date();
      return issueDate >= startDate && issueDate <= endDate;
    });
  }, [sales, date?.from, date?.to]);

  const totalRevenue = filteredSales
    .filter((sale) => sale.status === 'Paid' || sale.status === 'Partially Paid')
    .reduce((acc, sale) => acc + (sale.amountPaid ?? 0), 0);

  const paidInvoices = filteredSales.filter((sale) => sale.status === 'Paid').length;
  const overdueInvoices = filteredSales.filter((sale) => sale.status === 'Overdue').length;

  const exportToCSV = () => {
    if (!filteredSales.length) {
      toast({
        title: 'No data to export',
        description: 'Adjust your filters or create invoices to export data.',
      });
      return;
    }

    const headers = ['Invoice #', 'Customer', 'Amount', 'Amount Paid', 'Status', 'Sold By', 'Issue Date'];
    const rows = filteredSales.map((sale) =>
      [
        sale.invoiceNumber ?? sale.id,
        sale.customer,
        sale.amount,
        sale.amountPaid,
        sale.status,
        sale.soldBy,
        sale.displayIssueDate,
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sales_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isTenantLoading || areInvoicesLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Loading Accounting Dashboard...</h1>
        </div>
      </main>
    );
  }

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
            <div className="text-2xl font-bold">{currencyFormatter.format(totalRevenue)}</div>
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
                  <TableCell className="font-medium">{sale.invoiceNumber ?? sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{currencyFormatter.format(sale.amount)}</TableCell>
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
                  <TableCell>{sale.displayIssueDate}</TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No invoices found for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
