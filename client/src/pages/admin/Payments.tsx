import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
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
import { Search, Download, Filter, CreditCard, DollarSign, Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAYMENTS = [
  { id: 'TX-9821', user: 'Abebe Kebede', amount: 1500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-21' },
  { id: 'TX-9822', user: 'Tigist Alemu', amount: 500, currency: 'ETB', type: 'Donation', status: 'SUCCESS', date: '2025-05-21' },
  { id: 'TX-9823', user: 'Anonymous', amount: 100, currency: 'USD', type: 'Donation', status: 'PENDING', date: '2025-05-20' },
  { id: 'TX-9824', user: 'Dawit Meles', amount: 5000, currency: 'ETB', type: 'Membership', status: 'FAILED', date: '2025-05-20' },
  { id: 'TX-9825', user: 'Sara Tesfaye', amount: 500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-19' },
  { id: 'TX-9826', user: 'Kebede Tadesse', amount: 1500, currency: 'ETB', type: 'Membership', status: 'SUCCESS', date: '2025-05-19' },
  { id: 'TX-9827', user: 'Hanna Yilma', amount: 50, currency: 'USD', type: 'Donation', status: 'SUCCESS', date: '2025-05-18' },
  { id: 'TX-9828', user: 'Robel Assefa', amount: 150, currency: 'USD', type: 'Membership', status: 'SUCCESS', date: '2025-05-18' },
];

export default function AdminPayments() {
  // Calculate totals
  const etbMembership = PAYMENTS.filter(p => p.currency === 'ETB' && p.type === 'Membership' && p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const etbDonation = PAYMENTS.filter(p => p.currency === 'ETB' && p.type === 'Donation' && p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const usdMembership = PAYMENTS.filter(p => p.currency === 'USD' && p.type === 'Membership' && p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const usdDonation = PAYMENTS.filter(p => p.currency === 'USD' && p.type === 'Donation' && p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

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

        {/* Detailed Revenue Breakdown */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* ETB Totals */}
          <Card className="bg-zinc-50 border-zinc-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Landmark className="h-4 w-4" /> Total ETB Revenue
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{(etbMembership + etbDonation).toLocaleString()} ETB</div>
               <div className="mt-2 text-xs space-y-1">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Membership:</span>
                   <span className="font-medium">{etbMembership.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Donations:</span>
                   <span className="font-medium">{etbDonation.toLocaleString()}</span>
                 </div>
               </div>
             </CardContent>
          </Card>

          {/* USD Totals */}
          <Card className="bg-zinc-50 border-zinc-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <DollarSign className="h-4 w-4" /> Total USD Revenue
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">${(usdMembership + usdDonation).toLocaleString()}</div>
               <div className="mt-2 text-xs space-y-1">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Membership:</span>
                   <span className="font-medium">${usdMembership.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Donations:</span>
                   <span className="font-medium">${usdDonation.toLocaleString()}</span>
                 </div>
               </div>
             </CardContent>
          </Card>

          {/* Membership Breakdown */}
          <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <CreditCard className="h-4 w-4" /> Membership Revenue
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
                 <div className="flex justify-between items-baseline">
                   <span className="text-2xl font-bold">{etbMembership.toLocaleString()} ETB</span>
                 </div>
                 <div className="flex justify-between items-baseline border-t border-border pt-2">
                   <span className="text-lg font-bold">${usdMembership.toLocaleString()}</span>
                 </div>
               </div>
             </CardContent>
          </Card>

          {/* Donation Breakdown */}
          <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <CreditCard className="h-4 w-4" /> Donation Revenue
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
                 <div className="flex justify-between items-baseline">
                   <span className="text-2xl font-bold">{etbDonation.toLocaleString()} ETB</span>
                 </div>
                 <div className="flex justify-between items-baseline border-t border-border pt-2">
                   <span className="text-lg font-bold">${usdDonation.toLocaleString()}</span>
                 </div>
               </div>
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
                        {payment.currency === 'USD' ? '$' : ''}{payment.amount.toLocaleString()} {payment.currency === 'ETB' ? 'ETB' : ''}
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
          
          <TabsContent value="membership" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYMENTS.filter(p => p.type === 'Membership').map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.user}</TableCell>
                      <TableCell className="font-bold">
                        {payment.currency === 'USD' ? '$' : ''}{payment.amount.toLocaleString()} {payment.currency === 'ETB' ? 'ETB' : ''}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="donation" className="mt-0">
            <Card>
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
                  {PAYMENTS.filter(p => p.type === 'Donation').map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.user}</TableCell>
                      <TableCell className="font-bold">
                        {payment.currency === 'USD' ? '$' : ''}{payment.amount.toLocaleString()} {payment.currency === 'ETB' ? 'ETB' : ''}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
