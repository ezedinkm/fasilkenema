import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  CreditCard,
  DollarSign,
  Landmark,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { getAdminPayments } from "@/lib/api";

type AdminPayment = {
  id: string;
  user: string;
  amount: number;
  currency: "ETB" | "USD";
  type: "Membership" | "Renewal" | "Donation";
  status: "SUCCESS";
  date: string;
};

function typeLabel(t: AdminPayment["type"]) {
  if (t === "Renewal") return "Renewal";
  if (t === "Donation") return "Donation";
  return "New membership";
}

function isMembershipRow(p: AdminPayment) {
  return p.type === "Membership" || p.type === "Renewal";
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getAdminPayments();
        if (cancelled) return;
        const rows: AdminPayment[] = (Array.isArray(raw) ? raw : []).map(
          (row: Record<string, unknown>) => {
            const t = String(row.type || "");
            const type: AdminPayment["type"] =
              t === "Renewal"
                ? "Renewal"
                : t === "Donation"
                  ? "Donation"
                  : "Membership";
            return {
              id: String(row.id || ""),
              user: String(row.user || "—"),
              amount: Number(row.amount) || 0,
              currency:
                String(row.currency || "").toUpperCase() === "USD"
                  ? "USD"
                  : "ETB",
              type,
              status: "SUCCESS" as const,
              date: row.date ? String(row.date).slice(0, 10) : "",
            };
          },
        );
        setPayments(rows.filter((r) => r.id));
      } catch (error) {
        console.error("Error fetching payments:", error);
        if (!cancelled) setPayments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => {
      const blob = [
        p.id,
        p.user,
        typeLabel(p.type),
        p.type,
        p.currency,
        p.date,
        String(p.amount),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [payments, searchQuery]);

  const etbMembership = payments
    .filter((p) => p.currency === "ETB" && isMembershipRow(p))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const etbDonation = payments
    .filter((p) => p.currency === "ETB" && p.type === "Donation")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const usdMembership = payments
    .filter((p) => p.currency === "USD" && isMembershipRow(p))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const usdDonation = payments
    .filter((p) => p.currency === "USD" && p.type === "Donation")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const membershipRows = useMemo(
    () => filteredPayments.filter(isMembershipRow),
    [filteredPayments],
  );
  const donationRows = useMemo(
    () => filteredPayments.filter((p) => p.type === "Donation"),
    [filteredPayments],
  );

  const renderTableRows = (rows: AdminPayment[]) => {
    if (loading) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Loading completed payments…
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          {searchQuery.trim()
            ? "No completed payments match your search."
            : "No completed payments yet."}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
              Payments
            </h1>
            <p className="text-muted-foreground">
              Successful Chapa payments only: new memberships, renewals, and
              donations (no pending or failed).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              type="button"
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-zinc-50 border-zinc-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Landmark className="h-4 w-4" /> Total ETB Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(etbMembership + etbDonation).toLocaleString()} ETB
              </div>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Membership + renewal:
                  </span>
                  <span className="font-medium">
                    {etbMembership.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donations:</span>
                  <span className="font-medium">
                    {etbDonation.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-50 border-zinc-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Total USD Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(usdMembership + usdDonation).toLocaleString()}
              </div>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Membership + renewal:
                  </span>
                  <span className="font-medium">
                    ${usdMembership.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donations:</span>
                  <span className="font-medium">
                    ${usdDonation.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Membership &amp; renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">
                    {etbMembership.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-2">
                  <span className="text-lg font-bold">
                    ${usdMembership.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Donation revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">
                    {etbDonation.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-2">
                  <span className="text-lg font-bold">
                    ${usdDonation.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1 w-full max-w-xl">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, name, type, amount, date…"
                className="pl-9 bg-zinc-50 border-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-payments-search"
              />
            </div>
            {searchQuery.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </Button>
            )}
          </div>
          {!loading && payments.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim()
                ? `Showing ${filteredPayments.length} of ${payments.length} completed payments`
                : `${payments.length} completed payment${payments.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full min-w-0">
          <TabsList className="flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 sm:flex-wrap sm:overflow-visible">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="membership">
              Membership &amp; renewal
            </TabsTrigger>
            <TabsTrigger value="donation">Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              {renderTableRows(filteredPayments)}
              {!loading && filteredPayments.length > 0 && (
                <>
                  <div className="sm:hidden divide-y divide-zinc-200">
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-mono font-medium text-sm truncate">
                              {payment.id}
                            </div>
                            <div className="font-medium text-zinc-900 truncate">
                              {payment.user}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {typeLabel(payment.type)}
                            </div>
                            <div className="text-sm font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              Date: {payment.date}
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-green-600 hover:bg-green-600">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>User / Donor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono font-medium">
                              {payment.id}
                            </TableCell>
                            <TableCell>{payment.user}</TableCell>
                            <TableCell>{typeLabel(payment.type)}</TableCell>
                            <TableCell className="font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-600 hover:bg-green-600">
                                Paid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="membership" className="mt-4">
            <Card>
              {renderTableRows(membershipRows)}
              {!loading && membershipRows.length > 0 && (
                <>
                  <div className="sm:hidden divide-y divide-zinc-200">
                    {membershipRows.map((payment) => (
                      <div key={payment.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-mono font-medium text-sm truncate">
                              {payment.id}
                            </div>
                            <div className="font-medium text-zinc-900 truncate">
                              {payment.user}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {typeLabel(payment.type)}
                            </div>
                            <div className="text-sm font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              Date: {payment.date}
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-green-600 hover:bg-green-600">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Member</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {membershipRows.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono font-medium">
                              {payment.id}
                            </TableCell>
                            <TableCell>{payment.user}</TableCell>
                            <TableCell>{typeLabel(payment.type)}</TableCell>
                            <TableCell className="font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-600 hover:bg-green-600">
                                Paid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="donation" className="mt-4">
            <Card>
              {renderTableRows(donationRows)}
              {!loading && donationRows.length > 0 && (
                <>
                  <div className="sm:hidden divide-y divide-zinc-200">
                    {donationRows.map((payment) => (
                      <div key={payment.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-mono font-medium text-sm truncate">
                              {payment.id}
                            </div>
                            <div className="font-medium text-zinc-900 truncate">
                              {payment.user}
                            </div>
                            <div className="text-sm font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              Date: {payment.date}
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-green-600 hover:bg-green-600">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Donor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donationRows.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono font-medium">
                              {payment.id}
                            </TableCell>
                            <TableCell>{payment.user}</TableCell>
                            <TableCell className="font-bold">
                              {payment.currency === "USD" ? "$" : ""}
                              {payment.amount.toLocaleString()}{" "}
                              {payment.currency === "ETB" ? "ETB" : ""}
                            </TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-600 hover:bg-green-600">
                                Paid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
