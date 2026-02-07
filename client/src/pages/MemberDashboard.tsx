import PublicLayout from '@/components/PublicLayout';
import { ASSETS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LogOut, User, FileImage, FileText } from 'lucide-react';

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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadJPG = async () => {
    if (!cardRef.current || !member) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `membership-card-${member.membershipNumber}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !member) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`membership-card-${member.membershipNumber}.pdf`);
  };

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
    stamp: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.stamp')?.value : null) || null,
  };

  if (!member) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  const tierStyle = { accent: 'border-green-600' };
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

        <Card ref={cardRef} className="overflow-hidden border-2 border-[#8B1A1A] shadow-2xl rounded-2xl relative">
          <div className="relative" style={{ backgroundColor: '#F5F0E8' }}>
            <div className="px-5 py-3 text-center text-white" style={{ backgroundColor: '#8B1A1A' }}>
              <p className="font-heading text-base font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
              <p className="text-[11px] tracking-wider opacity-90">የጠቅላላ ጉባዔ ጥሪ ካርድ</p>
            </div>

            <svg className="absolute left-0 right-0 w-full" style={{ top: '55px', height: '200px', zIndex: 1 }} viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M0,120 Q100,60 200,100 T400,80 L400,95 Q300,135 200,115 T0,135 Z" fill="#228B22" opacity="0.9"/>
              <path d="M0,135 Q100,75 200,115 T400,95 L400,110 Q300,150 200,130 T0,150 Z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M0,150 Q100,90 200,130 T400,110 L400,125 Q300,165 200,145 T0,165 Z" fill="#DC143C" opacity="0.9"/>
            </svg>

            <div className="relative px-5 pt-4 pb-3" style={{ zIndex: 2 }}>
              <div className="flex gap-4 items-start">
                <div className="w-24 h-28 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0 shadow-md">
                  {member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                      data-testid="member-photo"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="px-3 py-1 rounded-md"
                      style={{ backgroundColor: '#DC143C' }}
                    >
                      <p className="text-[8px] uppercase tracking-wider text-white/80">MEMBERSHIP ID</p>
                      <p className="font-mono font-bold text-xs text-white" data-testid="membership-number">{member.membershipNumber}</p>
                    </div>
                  </div>
                  <div className="mb-1">
                    <p className="font-bold text-base leading-tight text-[#333]" data-testid="member-name">{member.fullName}</p>
                  </div>
                </div>

                {brandingSettings.stamp && (
                  <div className="flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                    <img 
                      src={brandingSettings.stamp} 
                      alt="Stamp" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="relative px-5 pb-4 space-y-1.5" style={{ zIndex: 2 }}>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">መአረግ / Rank</span>
                  <p className="text-sm font-semibold text-[#333] leading-tight">{member.rank || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">ዖታ / Sex</span>
                  <p className="text-sm font-semibold text-[#333] leading-tight">{member.gender || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">አድራሻ / Address</span>
                  <p className="text-sm font-semibold text-[#333] leading-tight">{member.address || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">ክፈለ ጦር/እዝ / Division</span>
                  <p className="text-sm font-semibold text-[#333] leading-tight">{member.division || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">ስልክ ቁጥር / Phone</span>
                  <p className="text-sm font-semibold text-[#333] leading-tight">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">★</span>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">የ ደጋፊነት ደረጃ / Level</span>
                  <p className="text-sm font-bold text-[#333] leading-tight capitalize">{member.tier}</p>
                </div>
              </div>

              {isExpired && (
                <div className="mt-2 px-3 py-1 bg-red-600 text-white text-xs text-center rounded font-bold">
                  ጊዜው ያለፈበት / EXPIRED
                </div>
              )}
            </div>

            <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: '#8B1A1A' }}>
              <div className="text-white text-xs space-y-0.5">
                <p>ያገልግልበት ቀን: {expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="font-semibold" style={{ color: member.status === 'active' ? '#90EE90' : '#FFB6C1' }}>
                  ሁኔታ: {member.status === 'active' ? 'ንቁ' : 'ያልነቃ'}
                </p>
              </div>
              {(brandingSettings.signature || brandingSettings.authorizedPersonName) && (
                <div className="text-center">
                  {brandingSettings.signature && (
                    <img 
                      src={brandingSettings.signature} 
                      alt="Authorized Signature" 
                      className="h-8 mx-auto mb-0.5"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                    />
                  )}
                  {brandingSettings.authorizedPersonName && (
                    <p className="text-[9px] text-white/70">{brandingSettings.authorizedPersonName}</p>
                  )}
                </div>
              )}
              <div className="p-1.5 bg-white rounded-lg shadow-sm" data-testid="qr-code">
                <QRCode 
                  value={`${window.location.origin}/card/${member.membershipNumber}`}
                  size={56}
                  level="M"
                />
              </div>
            </div>

            <div className="text-center py-2" style={{ backgroundColor: '#8B1A1A' }}>
              <p className="text-white font-heading text-sm font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleDownloadJPG}
            data-testid="button-download-jpg"
          >
            <FileImage className="mr-2 h-4 w-4" /> Download JPG
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleDownloadPDF}
            data-testid="button-download-pdf"
          >
            <FileText className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
