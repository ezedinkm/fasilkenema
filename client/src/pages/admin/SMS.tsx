import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Send, History, Users, MessageSquare, Edit } from 'lucide-react';

export default function AdminSMS() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900">SMS & Communications</h1>
            <p className="text-muted-foreground">Send broadcasts and manage message templates.</p>
          </div>
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
            GeezSMS Gateway Online
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Send Message */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Broadcast
                </CardTitle>
                <CardDescription>Send SMS updates to member segments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members (12,345)</SelectItem>
                      <SelectItem value="vip">VIP Members Only (450)</SelectItem>
                      <SelectItem value="premium">Premium Members (2,100)</SelectItem>
                      <SelectItem value="expired">Expired Memberships (890)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Template</label>
                  <Select defaultValue="custom">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Message</SelectItem>
                      <SelectItem value="match">Match Day Reminder</SelectItem>
                      <SelectItem value="renewal">Renewal Notice</SelectItem>
                      <SelectItem value="thankyou">Donation Thank You</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Message Body</label>
                    <span className="text-xs text-muted-foreground">0/160 characters</span>
                  </div>
                  <Textarea 
                    placeholder="Type your message here... Use {{name}} for personalization." 
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {"{{name}}, {{membership_id}}, {{expiry_date}}"}
                  </p>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 font-display uppercase tracking-wider">
                    Send Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Broadcasts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, type: 'Match Reminder', sent: '2 hrs ago', recipients: 12345, status: 'Delivered' },
                    { id: 2, type: 'Renewal Notice', sent: 'Yesterday', recipients: 150, status: 'Delivered' },
                    { id: 3, type: 'Shop Promo', sent: '3 days ago', recipients: 5000, status: 'Failed (Partial)' },
                  ].map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div>
                        <p className="font-medium">{log.type}</p>
                        <p className="text-xs text-muted-foreground">{log.sent} • {log.recipients} recipients</p>
                      </div>
                      <Badge variant="outline" className={log.status.includes('Failed') ? 'text-red-600 border-red-200 bg-red-50' : 'text-green-600 border-green-200 bg-green-50'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stats & Templates */}
          <div className="space-y-6">
             <Card className="bg-primary text-white">
               <CardHeader>
                 <CardTitle className="text-white">SMS Balance</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-4xl font-bold font-mono mb-2">24,500</div>
                 <p className="text-white/80 text-sm">Messages remaining</p>
                 <Button variant="secondary" size="sm" className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white border-none">
                   Top Up Balance
                 </Button>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle>Quick Templates</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {['Match Day', 'Welcome', 'Payment Confirm', 'Renewal Alert'].map((tpl) => (
                   <div key={tpl} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded cursor-pointer transition-colors border border-transparent hover:border-zinc-100">
                     <div className="flex items-center gap-2">
                       <MessageSquare className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm font-medium">{tpl}</span>
                     </div>
                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                       <Edit className="h-3 w-3" />
                     </Button>
                   </div>
                 ))}
                 <Button variant="outline" size="sm" className="w-full mt-2">
                   Manage All Templates
                 </Button>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
