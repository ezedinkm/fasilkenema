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
import { Search, Download, Filter, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Helper to generate initial mock data
const generateMembers = () => Array.from({ length: 10 }).map((_, i) => ({
  ...MOCK_MEMBER,
  id: i,
  membershipId: `FK-2025-${8832 + i}`,
  firstName: i % 2 === 0 ? 'Abebe' : 'Tigist',
  lastName: i % 2 === 0 ? 'Kebede' : 'Alemu',
  status: i === 3 ? 'EXPIRED' : 'ACTIVE',
  tier: i % 3 === 0 ? 'VIP' : (i % 2 === 0 ? 'PREMIUM' : 'REGULAR')
}));

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState(generateMembers());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    status: 'ACTIVE',
    tier: 'REGULAR'
  });

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({ firstName: '', lastName: '', status: 'ACTIVE', tier: 'REGULAR' });
    setIsDialogOpen(true);
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      status: member.status,
      tier: member.tier
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingMember) {
      // Edit
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...formData } : m));
      toast({ title: "Member Updated", description: "Member details updated successfully." });
    } else {
      // Create
      const newMember = {
        ...MOCK_MEMBER, // Fallback for other fields
        id: Date.now(),
        membershipId: `FK-2025-${Math.floor(Math.random() * 10000)}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        status: formData.status,
        tier: formData.tier,
        expiryDate: '2026-05-21', // Default one year
      };
      setMembers([newMember, ...members]);
      toast({ title: "Member Added", description: "New member has been registered." });
    }
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    // Simulate CSV export
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Tier,Status\n"
      + members.map(m => `${m.membershipId},${m.firstName} ${m.lastName},${m.tier},${m.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "members_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Started", description: "Downloading member list..." });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900">Members</h1>
            <p className="text-muted-foreground">Manage club membership and subscriptions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={formData.firstName} 
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={formData.lastName} 
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select 
                      value={formData.tier} 
                      onValueChange={(val) => setFormData({...formData, tier: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>Edit</Button>
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
