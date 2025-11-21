import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const PAYMENTS = [
  { id: 'TX-9821', user: 'Abebe Kebede', amount: 1500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-21' },
  { id: 'TX-9822', user: 'Tigist Alemu', amount: 500, currency: 'ETB', type: 'Donation', status: 'SUCCESS', date: '2025-05-21' },
  { id: 'TX-9823', user: 'Anonymous', amount: 100, currency: 'USD', type: 'Donation', status: 'PENDING', date: '2025-05-20' },
  { id: 'TX-9824', user: 'Dawit Meles', amount: 5000, currency: 'ETB', type: 'Membership', status: 'FAILED', date: '2025-05-20' },
  { id: 'TX-9825', user: 'Sara Tesfaye', amount: 500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-19' },
  { id: 'TX-9826', user: 'Kebede Tadesse', amount: 1500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-19' },
  { id: 'TX-9827', user: 'Hanna Yilma', amount: 50, currency: 'USD', type: 'Donation', status: 'SUCCESS', date: '2025-05-18' },
];

export default function AdminPayments() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900">Payments</h1>
            <p className="text-muted-foreground">Track memberships fees and donations.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231.89 ETB</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,400.00 ETB</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations (USD)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250.00</div>
              <p className="text-xs text-muted-foreground">International support</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="membership">Memberships</TabsTrigger>
              <TabsTrigger value="donation">Donations</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative max-w-sm hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-9 bg-white w-[200px] lg:w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User / Donor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYMENTS.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.user}</TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell className="font-bold">
                        {payment.currency === 'USD' ? '$' : ''}{payment.amount} {payment.currency === 'ETB' ? 'ETB' : ''}
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Badge className={`
                          ${payment.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' : ''}
                          ${payment.status === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                          ${payment.status === 'FAILED' ? 'bg-red-500 hover:bg-red-600' : ''}
                        `}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          {/* Other tabs would filter the data, keeping it simple for mockup */}
          <TabsContent value="membership" className="mt-0">
             <Card className="p-8 text-center text-muted-foreground">Filtered view for memberships...</Card>
          </TabsContent>
          <TabsContent value="donation" className="mt-0">
             <Card className="p-8 text-center text-muted-foreground">Filtered view for donations...</Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
