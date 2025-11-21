import AdminLayout from '@/components/AdminLayout';
import { MOCK_MEMBER } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Download, Filter } from 'lucide-react';

export default function AdminMembers() {
  // Create some mock data based on the single mock member
  const members = Array.from({ length: 10 }).map((_, i) => ({
    ...MOCK_MEMBER,
    id: i,
    membershipId: `FK-2025-${8832 + i}`,
    firstName: i % 2 === 0 ? 'Abebe' : 'Tigist',
    lastName: i % 2 === 0 ? 'Kebede' : 'Alemu',
    status: i === 3 ? 'EXPIRED' : 'ACTIVE',
    tier: i % 3 === 0 ? 'VIP' : (i % 2 === 0 ? 'PREMIUM' : 'REGULAR')
  }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900">Members</h1>
            <p className="text-muted-foreground">Manage club membership and subscriptions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Add Member
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-9 bg-zinc-50 border-zinc-200"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono font-medium">{member.membershipId}</TableCell>
                  <TableCell>{member.firstName} {member.lastName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${member.tier === 'VIP' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : ''}
                      ${member.tier === 'PREMIUM' ? 'border-primary text-primary bg-primary/5' : ''}
                    `}>
                      {member.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`
                      ${member.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''}
                      ${member.status === 'EXPIRED' ? 'bg-zinc-500 hover:bg-zinc-600' : ''}
                    `}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.expiryDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
