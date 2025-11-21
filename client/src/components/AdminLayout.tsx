import { Link, useLocation } from 'wouter';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  CreditCard,
  MessageSquare,
  Menu,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ASSETS } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout, user } = useApp();

  // Redirect if not admin (simple client-side check)
  if (!user || user.role !== 'admin') {
    // In a real app, we'd redirect here, but for the mockup flow we might be initializing
    // For now, we assume the parent component handles the redirect or we just render null
    // returning null causes a flash, so we'll render the layout but the content might be protected
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Members', href: '/admin/members' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
    { icon: FileText, label: 'Content', href: '/admin/content' },
    { icon: MessageSquare, label: 'SMS & Comms', href: '/admin/sms' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-white border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
        <img src={ASSETS.logo} alt="Logo" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="font-heading text-xl tracking-wide text-primary">EMPEROR</h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 mb-1 font-medium transition-all",
                location === item.href 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-9 w-9 border border-zinc-700">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-white">Administrator</p>
            <p className="text-xs text-zinc-500 truncate">admin@gmail.com</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-600"
          onClick={() => {
            logout();
            setLocation('/admin/login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-zinc-950 text-white shadow-md hover:bg-zinc-900">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-zinc-800 bg-zinc-950">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-end px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900">
               <Bell className="h-5 w-5" />
             </Button>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
