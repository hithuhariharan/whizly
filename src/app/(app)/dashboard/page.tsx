
'use client';

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  PlayCircle,
  PhoneOutgoing,
} from 'lucide-react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'January', leads: 186 },
  { month: 'February', leads: 305 },
  { month: 'March', leads: 237 },
  { month: 'April', leads: 73 },
  { month: 'May', leads: 209 },
  { month: 'June', leads: 214 },
];

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

const mockRecordings = [
    { id: 'rec1', from: 'John Doe', to: 'Olivia Martin', duration: '5m 32s', date: '2023-10-28 11:45 AM' },
    { id: 'rec2', from: 'Jane Smith', to: 'Jackson Lee', duration: '2m 10s', date: '2023-10-28 10:30 AM' },
    { id: 'rec3', from: 'John Doe', to: 'Sophia H.', duration: '12m 3s', date: '2023-10-27 04:15 PM' },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contacts
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                WhatsApp Conversations
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex items-center gap-4">
               <PhoneOutgoing className="h-6 w-6 text-muted-foreground" />
               <div className="grid gap-1">
                <CardTitle>Recent Call Recordings</CardTitle>
                <CardDescription>
                  Review recent calls made via MyOperator.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Call Details</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockRecordings.map(rec => (
                             <TableRow key={rec.id}>
                                <TableCell>
                                    <div className="font-medium">From: {rec.from} to {rec.to}</div>
                                    <div className="text-sm text-muted-foreground">{rec.date} ({rec.duration})</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <PlayCircle className="h-5 w-5" />
                                        <span className="sr-only">Play</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Lead Generation</CardTitle>
              <CardDescription>
                A summary of new leads over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                   <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
