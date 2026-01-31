import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { LogOut, CreditCard, User, Calendar, MapPin } from 'lucide-react';

interface MemberData {
  id: number;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  tier: string;
  photoUrl: string | null;
  expiryDate: string;
  status: string;
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [member, setMember] = useState<MemberData | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      const token = localStorage.getItem('memberToken');
      
      if (!token) {
        setLocation('/member/login');
        return;
      }

      try {
        const response = await fetch('/api/member/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('memberToken');
          localStorage.removeItem('memberData');
          toast({
            title: 'Session Expired',
            description: 'Please log in again',
            variant: 'destructive',
          });
          setLocation('/member/login');
          return;
        }

        const data = await response.json();
        setMember(data);
        localStorage.setItem('memberData', JSON.stringify(data));
      } catch {
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberData');
        setLocation('/member/login');
      }
    };

    fetchMemberData();
  }, [setLocation, toast]);

  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberData');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
    setLocation('/');
  };

  if (!member) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    silver: { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-white', border: 'border-gray-400' },
    gold: { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-black', border: 'border-yellow-500' },
    platinum: { bg: 'bg-gradient-to-br from-purple-400 to-purple-700', text: 'text-white', border: 'border-purple-500' },
  };

  const tierStyle = tierColors[member.tier.toLowerCase()] || tierColors.silver;
  const expiryDate = new Date(member.expiryDate);
  const isExpired = expiryDate < new Date();

  return (
    <PublicLayout>
      <div className="container px-4 py-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Membership</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className={`overflow-hidden ${tierStyle.border} border-2 shadow-xl`}>
          <div className={`${tierStyle.bg} ${tierStyle.text} p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm opacity-80 uppercase tracking-wider">Mechal FC Fan Club</h2>
                <p className="text-2xl font-bold mt-1">{member.tier.toUpperCase()} MEMBER</p>
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 border-2 border-white/50">
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                    data-testid="member-photo"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 opacity-60" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xl font-bold" data-testid="member-name">{member.fullName}</p>
              <p className="text-lg opacity-90 font-mono mt-1" data-testid="membership-number">
                {member.membershipNumber}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
              <Calendar className="w-4 h-4" />
              <span>Valid until: {expiryDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              {isExpired && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded">EXPIRED</span>
              )}
            </div>
          </div>
          
          <CardContent className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border" data-testid="qr-code">
                <QRCode 
                  value={`${window.location.origin}/membership-card/${member.membershipNumber}`}
                  size={80}
                  level="M"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Membership Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${member.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Tier</span>
                <span className="font-medium">{member.tier}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Member ID</span>
                <span className="font-mono font-medium">{member.membershipNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-medium">{expiryDate.toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
