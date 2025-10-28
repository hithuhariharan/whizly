
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
  Wand2,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { analyzeCall } from '@/ai/flows/analyze-call';
import type { AnalyzeCallOutput } from '@/ai/flows/analyze-call';

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
    { id: 'rec1', from: 'John Doe', to: 'Olivia Martin', duration: '5m 32s', date: '2023-10-28 11:45 AM', transcript: "Employee: Hello, thank you for calling Whizly AI, this is John. How can I help you?\nCustomer: Hi John, I'm interested in your services but I'm not sure which plan is right for me.\nEmployee: I can certainly help with that! Can you tell me a bit about your business and what you're looking for?\nCustomer: We're a small e-commerce store, and we need help managing customer inquiries via WhatsApp." },
    { id: 'rec2', from: 'Jane Smith', to: 'Jackson Lee', duration: '2m 10s', date: '2023-10-28 10:30 AM', transcript: "Employee: Hi, this is Jane from Whizly AI. I'm following up on your recent inquiry.\nCustomer: Oh, right. I was wondering about the pricing.\nEmployee: Our basic plan starts at $49/month. It includes the chatbot and CRM integration.\nCustomer: Okay, that sounds reasonable. I'll think about it." },
    { id: 'rec3', from: 'John Doe', to: 'Sophia H.', duration: '12m 3s', date: '2023-10-27 04:15 PM', transcript: "Customer: I'm having trouble setting up the Meta Pixel integration. It's not working.\nEmployee: I'm sorry to hear that. Let's walk through it. Can you tell me what error you're seeing?\nCustomer: It just says 'Connection Failed'. I've double-checked the Pixel ID.\nEmployee: Okay, let's try reconnecting the account from scratch. Go to the integrations page..." },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCallOutput | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<(typeof mockRecordings[0]) | null>(null);
  
  const handlePlay = (recId: string) => {
    toast({
        title: `Playing recording ${recId}`,
        description: 'Playback functionality would be implemented here.',
    });
  }

  const handleAnalyze = async (recording: typeof mockRecordings[0]) => {
    setSelectedRecording(recording);
    setIsAnalysisDialogOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        const result = await analyzeCall({ callTranscript: recording.transcript });
        setAnalysisResult(result);
    } catch(error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not analyze the call recording.',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }


  return (
    <>
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
                  Review and analyze recent calls made via MyOperator.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Call Details</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockRecordings.map(rec => (
                             <TableRow key={rec.id}>
                                <TableCell>
                                    <div className="font-medium">From: {rec.from} to {rec.to}</div>
                                    <div className="text-sm text-muted-foreground">{rec.date} ({rec.duration})</div>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handlePlay(rec.id)}>
                                        <PlayCircle className="h-5 w-5" />
                                        <span className="sr-only">Play</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleAnalyze(rec)}>
                                        <Wand2 className="h-5 w-5" />
                                        <span className="sr-only">Analyze</span>
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

    <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>AI Call Analysis</DialogTitle>
                <DialogDescription>
                    For call from {selectedRecording?.from} to {selectedRecording?.to} on {selectedRecording?.date}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                {isAnalyzing && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span className="text-lg">Analyzing call...</span>
                    </div>
                )}
                {analysisResult && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Call Summary & Notes</h3>
                            <Card className="bg-muted/50">
                                <CardContent className="p-4 text-sm">
                                    <pre className="whitespace-pre-wrap font-sans">{analysisResult.summary}</pre>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Employee Performance Feedback</h3>
                             <Card className="border-amber-300 bg-amber-50/30">
                                <CardContent className="p-4 text-sm">
                                    <pre className="whitespace-pre-wrap font-sans">{analysisResult.performanceFeedback}</pre>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
