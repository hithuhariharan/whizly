'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bot,
  Contact,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plug,
  Settings,
  Users,
} from 'lucide-react';
import { WhizlyLogo } from '@/components/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    label: 'CRM',
    items: [
      { href: '/crm/leads', icon: Users, label: 'Leads' },
      { href: '/crm/contacts', icon: Contact, label: 'Contacts' },
      { href: '/crm/deals', icon: MessageSquare, label: 'Deals' },
    ],
  },
  { href: '/integrations', icon: Plug, label: 'Integrations' },
  { href: '/chatbot', icon: Bot, label: 'Chatbot Agent' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <WhizlyLogo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              Whizly AI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) =>
              'items' in item ? (
                <SidebarMenuItem key={item.label} className="relative">
                  <span className="px-2 text-xs font-medium uppercase text-sidebar-foreground/70">
                    {item.label}
                  </span>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.href}>
                        <Link href={subItem.href} legacyBehavior passHref>
                          <SidebarMenuButton
                            isActive={pathname === subItem.href}
                            tooltip={subItem.label}
                          >
                            <subItem.icon />
                            <span>{subItem.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="User" data-ai-hint="person avatar"/>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">User</p>
                  <p className="text-xs text-muted-foreground">user@whizly.ai</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/login')}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
