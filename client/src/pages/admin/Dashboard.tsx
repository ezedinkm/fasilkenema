import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";
import SearchConsoleSetup from "@/components/admin/SearchConsoleSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAdminDashboardStats } from "@/lib/api";

type DashboardStats = {
  totalMembers: number;
  membershipETB: number;
  membershipUSD: number;
  manualMembershipETB: number;
  manualMembershipUSD: number;
  donationETB: number;
  donationUSD: number;
  growth: Array<{ name: string; members: number }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    membershipETB: 0,
    membershipUSD: 0,
    manualMembershipETB: 0,
    manualMembershipUSD: 0,
    donationETB: 0,
    donationUSD: 0,
  });
  const [totalMembers, setTotalMembers] = useState(0);
  const [growthData, setGrowthData] = useState<
    Array<{ name: string; members: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData: DashboardStats = await getAdminDashboardStats();
        setStats({
          membershipETB: Number(dashboardData.membershipETB) || 0,
          membershipUSD: Number(dashboardData.membershipUSD) || 0,
          manualMembershipETB:
            Number(dashboardData.manualMembershipETB) || 0,
          manualMembershipUSD:
            Number(dashboardData.manualMembershipUSD) || 0,
          donationETB: Number(dashboardData.donationETB) || 0,
          donationUSD: Number(dashboardData.donationUSD) || 0,
        });
        setTotalMembers(Number(dashboardData.totalMembers) || 0);
        setGrowthData(dashboardData.growth ?? []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRevenueETB = stats.membershipETB + stats.donationETB;
  const totalRevenueUSD = stats.membershipUSD + stats.donationUSD;
  const revenueCards = [
    {
      title: "Membership Revenue (ETB)",
      amount: stats.membershipETB,
      currency: "ETB",
      description: "Membership fees and renewals",
    },
    {
      title: "Membership Revenue (USD)",
      amount: stats.membershipUSD,
      currency: "USD",
      description: "Membership fees and renewals",
    },
    {
      title: "Manual Member Revenue (ETB)",
      amount: stats.manualMembershipETB,
      currency: "ETB",
      description: "Subset of membership revenue recorded by admins",
    },
    {
      title: "Manual Member Revenue (USD)",
      amount: stats.manualMembershipUSD,
      currency: "USD",
      description: "Subset of membership revenue recorded by admins",
    },
    {
      title: "Donation Revenue (ETB)",
      amount: stats.donationETB,
      currency: "ETB",
      description: "Completed donations",
    },
    {
      title: "Donation Revenue (USD)",
      amount: stats.donationUSD,
      currency: "USD",
      description: "Completed donations",
    },
    {
      title: "Combined Revenue (ETB)",
      amount: totalRevenueETB,
      currency: "ETB",
      description: "Memberships + donations",
    },
    {
      title: "Combined Revenue (USD)",
      amount: totalRevenueUSD,
      currency: "USD",
      description: "Memberships + donations",
    },
  ];
  const formatRevenue = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of club performance and metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : totalMembers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered members
              </p>
            </CardContent>
          </Card>
          {revenueCards.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                {metric.currency === "USD" ? (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : formatRevenue(metric.amount, metric.currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
          </CardHeader>
          <CardContent className="pl-1 pr-1 sm:pl-2 sm:pr-2 -mx-1 sm:mx-0 overflow-x-auto">
            <div className="h-[220px] sm:h-[300px] md:h-[350px] w-full min-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={growthData}
                  margin={{ top: 8, right: 4, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f4f4f5" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="members"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <VisitorAnalytics />
        <SearchConsoleSetup />
      </div>
    </AdminLayout>
  );
}
