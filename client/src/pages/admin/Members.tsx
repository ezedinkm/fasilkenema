import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
import { Search, Download, Filter, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getMembers, createMember, updateMember, deleteMember } from '@/lib/api';
import type { Member } from '@shared/schema';

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: 'Ethiopia',
    city: '',
    tier: 'silver',
    status: 'active',
    membershipNumber: '',
    photoUrl: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load members" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      country: 'Ethiopia',
      city: '',
      tier: 'silver',
      status: 'active',
      membershipNumber: `FK-${Date.now()}`,
      photoUrl: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      country: member.country,
      city: member.city,
      tier: member.tier,
      status: member.status,
      membershipNumber: member.membershipNumber,
      photoUrl: member.photoUrl || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
        toast({ title: "Success", description: "Member updated successfully." });
      } else {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        await createMember({
          ...formData,
          expiryDate: expiryDate.toISOString(),
        });
        toast({ title: "Success", description: "New member added successfully." });
      }
      fetchMembers();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to save member" 
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      await deleteMember(id);
      toast({ title: "Success", description: "Member deleted successfully." });
      fetchMembers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete member" });
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Email,Phone,Tier,Status,Joined\n"
      + members.map(m => `${m.membershipNumber},${m.fullName},${m.email},${m.phone},${m.tier},${m.status},${new Date(m.joinedDate).toLocaleDateString()}`).join("\n");
    
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
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleCreate} data-testid="button-add-member">
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.dateOfBirth} 
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
                      data-testid="input-dob"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input 
                        value={formData.country} 
                        onChange={(e) => setFormData({...formData, country: e.target.value})} 
                        data-testid="input-country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        data-testid="input-city"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Membership Tier</Label>
                    <Select 
                      value={formData.tier} 
                      onValueChange={(val) => setFormData({...formData, tier: val})}
                    >
                      <SelectTrigger data-testid="select-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} data-testid="button-save-member">Save Changes</Button>
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
              data-testid="input-search"
            />
          </div>
          <Button variant="outline" size="icon" data-testid="button-filter">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading members...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="w-[140px]">ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No members yet. Add your first member to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell className="font-mono font-medium">{member.membershipNumber}</TableCell>
                      <TableCell>{member.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${member.tier === 'platinum' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : ''}
                          ${member.tier === 'gold' ? 'border-primary text-primary bg-primary/5' : ''}
                        `}>
                          {member.tier.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`
                          ${member.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                          ${member.status === 'expired' ? 'bg-zinc-500 hover:bg-zinc-600' : ''}
                          ${member.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                        `}>
                          {member.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.joinedDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member)} data-testid={`button-edit-${member.id}`}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-700" data-testid={`button-delete-${member.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
