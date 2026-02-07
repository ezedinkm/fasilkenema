import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { useQuery } from '@tanstack/react-query';
import { LogOut, User } from 'lucide-react';

interface MemberData {
  id: number;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  rank: string | null;
  gender: string | null;
  address: string | null;
  division: string | null;
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

  const { data: branding } = useQuery<any[]>({
    queryKey: ['/api/public/branding'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    signature: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.signature')?.value : null) || null,
    authorizedPersonName: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.authorizedPersonName')?.value : null) || null,
  };

  if (!member) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  const tierColors: Record<string, { bg: string; accent: string }> = {
    silver: { bg: 'from-gray-600 to-gray-800', accent: 'border-gray-400' },
    gold: { bg: 'from-yellow-600 to-yellow-900', accent: 'border-yellow-500' },
    platinum: { bg: 'from-purple-600 to-purple-900', accent: 'border-purple-500' },
  };

  const tierStyle = tierColors[member.tier.toLowerCase()] || tierColors.silver;
  const expiryDate = new Date(member.expiryDate);
  const isExpired = expiryDate < new Date();

  return (
    <PublicLayout>
      <div className="container px-4 py-8 max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">የ አባልነት መታወቂያ</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            ውጣ
          </Button>
        </div>

        <Card className={`overflow-hidden ${tierStyle.accent} border-2 shadow-2xl rounded-2xl`}>
          <div className={`bg-gradient-to-br ${tierStyle.bg} text-white p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold tracking-wider">MECHAL FC</h2>
                <p className="text-xs opacity-80 tracking-widest">የ ደጋፊዎች ክለብ</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">MEMBERSHIP ID</p>
                <p className="font-mono font-bold text-sm" data-testid="membership-number">{member.membershipNumber}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-24 h-28 rounded-lg overflow-hidden bg-white/20 border-2 border-white/40 flex-shrink-0">
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

              <div className="flex-1 space-y-1.5 text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">ሙሉ ስም</span>
                  <p className="font-bold text-base leading-tight" data-testid="member-name">{member.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">መአረግ</span>
                  <p className="font-medium leading-tight">{member.rank || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">ዖታ</span>
                  <p className="font-medium leading-tight">{member.gender || '—'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60">አድራሻ</span>
                <p className="font-medium leading-tight">{member.address || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60">ክፈለ ጦር/እዝ</span>
                <p className="font-medium leading-tight">{member.division || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60">ስልክ ቁጥር</span>
                <p className="font-medium leading-tight">{member.phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60">የ ደጋፊነት ደረጃ</span>
                <p className="font-bold leading-tight capitalize">{member.tier}</p>
              </div>
            </div>

            {isExpired && (
              <div className="mt-3 px-3 py-1 bg-red-500/80 text-white text-xs text-center rounded">
                ጊዜው ያለፈበት / EXPIRED
              </div>
            )}
          </div>
          
          <CardContent className="bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>ያገልግልበት ቀን: {expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className={`font-medium ${member.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  ሁኔታ: {member.status === 'active' ? 'ንቁ' : 'ያልነቃ'}
                </p>
              </div>
              {(brandingSettings.signature || brandingSettings.authorizedPersonName) && (
                <div className="text-center">
                  {brandingSettings.signature && (
                    <img 
                      src={brandingSettings.signature} 
                      alt="Authorized Signature" 
                      className="h-10 mx-auto mb-0.5"
                      style={{ opacity: 0.7 }}
                    />
                  )}
                  {brandingSettings.authorizedPersonName && (
                    <p className="text-[9px] text-muted-foreground">{brandingSettings.authorizedPersonName}</p>
                  )}
                </div>
              )}
              <div className="p-1.5 bg-white rounded-lg shadow-sm border" data-testid="qr-code">
                <QRCode 
                  value={`${window.location.origin}/card/${member.membershipNumber}`}
                  size={64}
                  level="M"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
