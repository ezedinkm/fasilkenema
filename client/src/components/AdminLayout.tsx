import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  MessageSquare,
  Mail,
  PlayCircle,
  Menu,
  Bell,
  Briefcase,
  Share2,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ASSETS } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileBottomNav from "./MobileBottomNav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logout, user } = useApp();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  if (!user || user.role !== "admin") {
    // Parent routes typically handle redirect; avoid layout flash where possible.
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Members", href: "/admin/members" },
    { icon: CreditCard, label: "Payments", href: "/admin/payments" },
    { icon: FileText, label: "Content", href: "/admin/content" },
    { icon: Briefcase, label: "Careers", href: "/admin/careers" },
    { icon: Share2, label: "Social Links", href: "/admin/social-links" },
    { icon: ListOrdered, label: "League Table", href: "/admin/league-table" },
    { icon: Mail, label: "Newsletter", href: "/admin/newsletter" },
    { icon: MessageSquare, label: "SMS & Comms", href: "/admin/sms" },
    { icon: PlayCircle, label: "Watch Reviews", href: "/admin/watchreview" },
    { icon: Mail, label: "User Message", href: "/admin/usermessage" },
    { icon: UserPlus, label: "TEAM", href: "/admin/team" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full bg-[#9B0F06] text-white border-r border-white/20">
      <div className="p-4 sm:p-6 flex items-center gap-3 border-b border-white/20">
        <div className="bg-white rounded-full p-2 shrink-0">
          <img
            src={ASSETS.logo}
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-lg sm:text-xl tracking-wide text-white font-bold truncate">
            FASIL FC
          </h1>
          <p className="text-[10px] text-white uppercase tracking-wider font-bold">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4 sm:py-6 px-2 sm:px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onNavigate?.()}
              className={cn(
                "w-full justify-start gap-3 mb-1 font-medium transition-all h-auto min-h-10 py-2.5 px-3 text-left whitespace-normal",
                location === item.href
                  ? "bg-white/20 text-white hover:bg-white/25 hover:text-white"
                  : "text-white hover:text-white hover:bg-white/10",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="text-sm leading-tight">{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-white/20 shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2 min-w-0">
          <Avatar className="h-9 w-9 border border-white/30 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-red-600 text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium truncate text-white">
              Administrator
            </p>
            <p className="text-xs text-white/80 truncate">admin@gmail.com</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-white/40 text-white hover:text-white hover:bg-white/10 hover:border-white/60"
          onClick={() => {
            logout();
            setLocation("/admin/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen-safe bg-zinc-100 flex">
      {/* Tablet + desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed z-50 h-11 w-11 rounded-md bg-[#9B0F06] text-white shadow-md hover:bg-[#7F0C05] left-3 top-[max(0.75rem,env(safe-area-inset-top,0px))]"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-[min(18rem,calc(100vw-2rem))] border-r-white/20 bg-[#9B0F06] pt-safe flex flex-col"
          >
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full min-w-0">
        <header className="hidden md:flex h-14 lg:h-16 bg-white border-b border-zinc-200 items-center justify-end px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-zinc-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <div
          className={cn(
            "flex-1 min-w-0 px-3 sm:px-4 md:px-6 lg:px-8",
            "pb-24 md:pb-8",
            "pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-6 lg:pt-8",
          )}
        >
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
