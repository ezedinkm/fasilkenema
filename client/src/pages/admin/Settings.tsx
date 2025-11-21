import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';

export default function AdminSettings() {
  const { toast } = useToast();
  
  // State for membership tiers
  const [tiers, setTiers] = useState(MEMBERSHIP_TIERS);
  const [isAddTierOpen, setIsAddTierOpen] = useState(false);
  const [newTier, setNewTier] = useState({
    id: '',
    name: '',
    priceEtb: '',
    priceUsd: ''
  });

  const handleUpdateTier = (id: string, field: string, value: any) => {
    setTiers(tiers.map(t => {
      if (t.id === id) {
        if (field === 'priceEtb') return { ...t, price: { ...t.price, etb: parseInt(value) || 0 } };
        if (field === 'priceUsd') return { ...t, price: { ...t.price, usd: parseInt(value) || 0 } };
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleAddTier = () => {
    const id = newTier.name.toLowerCase().replace(/\s+/g, '-');
    const tierToAdd = {
      id,
      name: newTier.name,
      price: { 
        etb: parseInt(newTier.priceEtb) || 0, 
        usd: parseInt(newTier.priceUsd) || 0 
      },
      benefits: ['Standard Benefits'],
      color: 'bg-zinc-100 text-zinc-900',
      recommended: false
    };
    
    setTiers([...tiers, tierToAdd]);
    setNewTier({ id: '', name: '', priceEtb: '', priceUsd: '' });
    setIsAddTierOpen(false);
    toast({ title: "Tier Added", description: `${tierToAdd.name} has been added.` });
  };

  const handleDeleteTier = (id: string) => {
    if (confirm('Are you sure you want to delete this membership tier?')) {
      setTiers(tiers.filter(t => t.id !== id));
      toast({ title: "Tier Deleted", description: "Membership tier removed." });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900">System Settings</h1>
          <p className="text-muted-foreground">Configure platform preferences and integrations.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="membership">Membership Fees</TabsTrigger>
            <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic configuration for the fan club platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Fasil Kenema Fan Club" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input id="site-url" defaultValue="https://fasilkenema.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@fasilkenema.com" />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Disable public access to the site.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Membership Tiers & Pricing</CardTitle>
                  <CardDescription>Update pricing for annual memberships.</CardDescription>
                </div>
                <Dialog open={isAddTierOpen} onOpenChange={setIsAddTierOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tier Name</Label>
                        <Input 
                          value={newTier.name} 
                          onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                          placeholder="e.g. Gold" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (ETB)</Label>
                          <Input 
                            type="number" 
                            value={newTier.priceEtb} 
                            onChange={(e) => setNewTier({...newTier, priceEtb: e.target.value})}
                            placeholder="0" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (USD)</Label>
                          <Input 
                            type="number" 
                            value={newTier.priceUsd} 
                            onChange={(e) => setNewTier({...newTier, priceUsd: e.target.value})}
                            placeholder="0" 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddTierOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddTier}>Add Tier</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <div key={tier.id} className={`space-y-4 p-4 border rounded-lg relative group ${tier.id === 'premium' ? 'bg-primary/5 border-primary/20' : (tier.id === 'vip' ? 'bg-yellow-50 border-yellow-200' : 'bg-zinc-50/50')}`}>
                      <div className="flex justify-between items-start">
                        <Input 
                          value={tier.name} 
                          onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                          className="font-bold text-lg bg-transparent border-transparent hover:border-input focus:border-input px-0 h-auto"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTier(tier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Price (ETB)</Label>
                        <Input 
                          type="number" 
                          value={tier.price.etb} 
                          onChange={(e) => handleUpdateTier(tier.id, 'priceEtb', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (USD)</Label>
                        <Input 
                          type="number" 
                          value={tier.price.usd} 
                          onChange={(e) => handleUpdateTier(tier.id, 'priceUsd', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Saved", description: "Membership settings updated." })}>
                  <Save className="mr-2 h-4 w-4" /> Update Pricing
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Integrations</CardTitle>
                <CardDescription>Manage keys for Chapa and other providers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">CH</div>
                      <div>
                        <h4 className="font-bold">Chapa Payment</h4>
                        <p className="text-xs text-muted-foreground">Primary gateway for ETB/USD</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  
                  <div className="grid gap-2 ml-10">
                    <Label>Public Key</Label>
                    <Input type="password" value="CHAPAPUBK-xxxxxxxxxxxxxxxx" readOnly className="font-mono bg-zinc-50" />
                  </div>
                  <div className="grid gap-2 ml-10">
                    <Label>Secret Key</Label>
                    <Input type="password" value="CHAPASECK-xxxxxxxxxxxxxxxx" readOnly className="font-mono bg-zinc-50" />
                  </div>
                  
                  <div className="ml-10 flex items-center gap-2">
                    <Switch id="sandbox" defaultChecked />
                    <Label htmlFor="sandbox">Sandbox Mode</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="opacity-50">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">PP</div>
                      <div>
                        <h4 className="font-bold">PayPal</h4>
                        <p className="text-xs text-muted-foreground">International donations</p>
                      </div>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
