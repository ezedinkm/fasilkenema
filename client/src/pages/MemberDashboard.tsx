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
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = '540px';
    el.style.minWidth = '540px';
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F5F0E8',
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const link = document.createElement('a');
      link.download = `membership-card-${member.membershipNumber}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !member) return;
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = '540px';
    el.style.minWidth = '540px';
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F5F0E8',
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`membership-card-${member.membershipNumber}.pdf`);
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
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
      <div className="container px-4 py-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">የ አባልነት መታወቂያ</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            ውጣ
          </Button>
        </div>

        <div className="overflow-x-auto">
        <Card ref={cardRef} className="overflow-hidden border-2 border-[#8B1A1A] shadow-2xl rounded-2xl relative" style={{ width: '540px', height: '340px' }}>
          <div className="relative h-full" style={{ backgroundColor: '#F5F0E8' }}>
            <div className="px-4 py-2 text-center text-white" style={{ backgroundColor: '#8B1A1A' }}>
              <p className="font-heading text-sm font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
              <p className="text-[10px] tracking-wider opacity-90">የጠቅላላ ጉባዔ ጥሪ ካርድ</p>
            </div>

            <svg className="absolute left-0 right-0 w-full" style={{ top: '34px', height: '100px', zIndex: 1 }} viewBox="0 0 540 100" preserveAspectRatio="none">
              <path d="M0,55 Q135,25 270,50 T540,35 L540,47 Q405,70 270,58 T0,67 Z" fill="#228B22" opacity="0.9"/>
              <path d="M0,67 Q135,37 270,58 T540,47 L540,57 Q405,80 270,68 T0,77 Z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M0,77 Q135,47 270,68 T540,57 L540,67 Q405,90 270,78 T0,87 Z" fill="#DC143C" opacity="0.9"/>
            </svg>

            <div className="relative flex gap-3 px-3 pt-2 pb-1" style={{ zIndex: 2 }}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300 shadow-md">
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
                <div 
                  className="px-2 py-0.5 rounded-md text-center"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <p className="text-[7px] uppercase tracking-wider text-white/80">MEMBERSHIP ID</p>
                  <p className="font-mono font-bold text-[10px] text-white" data-testid="membership-number">{member.membershipNumber}</p>
                </div>
              </div>

              <div className="flex-1 space-y-0.5">
                <p className="font-bold text-sm leading-tight text-[#333] mb-0.5" data-testid="member-name">{member.fullName}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">መአረግ:</span> <span className="font-semibold">{member.rank || '—'}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">ዖታ:</span> <span className="font-semibold">{member.gender || '—'}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">አድራሻ:</span> <span className="font-semibold">{member.address || '—'}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">ክፈለ ጦር/እዝ:</span> <span className="font-semibold">{member.division || '—'}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">ስልክ ቁጥር:</span> <span className="font-semibold">{member.phone}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#DC143C] text-[10px]">★</span>
                  <p className="text-[10px] text-[#333]"><span className="text-gray-500">የ ደጋፊነት ደረጃ:</span> <span className="font-bold capitalize">{member.tier}</span></p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between flex-shrink-0">
                {brandingSettings.stamp && (
                  <div style={{ width: '75px', height: '75px' }}>
                    <img 
                      src={brandingSettings.stamp} 
                      alt="Stamp" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}
                <div className="p-1 bg-white rounded shadow-sm mt-1" data-testid="qr-code">
                  <QRCode 
                    value={`${window.location.origin}/card/${member.membershipNumber}`}
                    size={42}
                    level="M"
                  />
                </div>
              </div>
            </div>

            {isExpired && (
              <div className="relative mx-4 mb-2 px-3 py-1 bg-red-600 text-white text-xs text-center rounded font-bold" style={{ zIndex: 2 }}>
                ጊዜው ያለፈበት / EXPIRED
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: '#8B1A1A' }}>
              <div className="text-white text-[9px] space-y-0">
                <p>ያገልግልበት ቀን: {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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
                      className="h-6 mx-auto"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                    />
                  )}
                  {brandingSettings.authorizedPersonName && (
                    <p className="text-[7px] text-white/70">{brandingSettings.authorizedPersonName}</p>
                  )}
                </div>
              )}
              <p className="text-white font-heading text-[9px] font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
            </div>
          </div>
        </Card>
        </div>

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
