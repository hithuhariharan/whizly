'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bot,
  Contact,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  MessageSquare,
  Plug,
  Send,
  Settings,
  Users,
  Volume2,
  Shield,
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
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

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
  {
    label: 'Features',
    items: [
      { href: '/integrations', icon: Plug, label: 'Integrations' },
      { href: '/chatbot', icon: Inbox, label: 'Inbox' },
      { href: '/broadcasts', icon: Send, label: 'Broadcasts' },
      { href: '/campaigns', icon: Volume2, label: 'Campaigns' },
      { href: '/resources', icon: Library, label: 'Resource Library' },
    ],
  },
];

const adminNavItems = [
    { href: '/team', icon: Shield, label: 'Team' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<{role: string}>(userDocRef);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
                         <Link href={subItem.href} passHref>
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
                   <Link href={item.href} passHref>
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
             {userProfile?.role === 'Admin' && (
                <SidebarMenuItem className="relative">
                    <span className="px-2 text-xs font-medium uppercase text-sidebar-foreground/70">
                        Admin
                    </span>
                    <SidebarMenu>
                        {adminNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href} passHref>
                                    <SidebarMenuButton
                                        isActive={pathname === item.href}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || "https://picsum.photos/seed/user/100/100"} alt="User" data-ai-hint="person avatar"/>
                  <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings">
                 <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
