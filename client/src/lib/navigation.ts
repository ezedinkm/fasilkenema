import {
  Home,
  Info,
  Newspaper,
  Users,
  Heart,
  Mail,
  LayoutDashboard,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
}

export const publicNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "News", href: "/blog", icon: Newspaper },
  { label: "Join", href: "/membership", icon: Users },
  { label: "Donate", href: "/donate", icon: Heart },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith("/admin");
};
