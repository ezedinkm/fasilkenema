import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw } from 'lucide-react';

export default function AdminSettings() {
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
              <CardHeader>
                <CardTitle>Membership Tiers & Pricing</CardTitle>
                <CardDescription>Update pricing for annual memberships.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg bg-zinc-50/50">
                    <h3 className="font-bold text-lg">Regular</h3>
                    <div className="space-y-2">
                      <Label>Price (ETB)</Label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (USD)</Label>
                      <Input type="number" defaultValue="15" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <h3 className="font-bold text-lg text-primary">Premium</h3>
                    <div className="space-y-2">
                      <Label>Price (ETB)</Label>
                      <Input type="number" defaultValue="1500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (USD)</Label>
                      <Input type="number" defaultValue="45" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <h3 className="font-bold text-lg text-yellow-700">VIP</h3>
                    <div className="space-y-2">
                      <Label>Price (ETB)</Label>
                      <Input type="number" defaultValue="5000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (USD)</Label>
                      <Input type="number" defaultValue="150" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
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
