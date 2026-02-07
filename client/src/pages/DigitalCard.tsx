import PublicLayout from '@/components/PublicLayout';
import { ASSETS } from '@/lib/mockData';
import QRCode from 'react-qr-code';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileImage, FileText, User } from 'lucide-react';

interface MemberData {
  membershipNumber: string;
  fullName: string;
  rank: string | null;
  gender: string | null;
  address: string | null;
  division: string | null;
  phone: string;
  tier: string;
  photoUrl: string | null;
  joinedDate: string;
  expiryDate: string;
  status: string;
}

export default function DigitalCard() {
  const [match, params] = useRoute('/card/:membershipNumber');
  const cardRef = useRef<HTMLDivElement>(null);
  
  const membershipNumber = params?.membershipNumber;

  const { data: member, isLoading, error } = useQuery<MemberData>({
    queryKey: ['/api/public/member', membershipNumber],
    queryFn: async () => {
      const res = await fetch(`/api/public/member/${membershipNumber}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Member not found');
      }
      return res.json();
    },
    enabled: !!membershipNumber,
  });

  const handleDownloadPNG = async () => {
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
      link.download = `membership-card-${member.membershipNumber}.png`;
      link.href = canvas.toDataURL('image/png');
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
  
  const { data: branding } = useQuery<any[]>({
    queryKey: ['/api/public/branding'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'MECHAL FC',
    headerSubtext: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.headerSubtext')?.value : null) || 'SPORT CLUB',
    signature: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.signature')?.value : null) || null,
    authorizedPersonName: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.authorizedPersonName')?.value : null) || null,
    stamp: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.stamp')?.value : null) || null,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-zinc-100 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading membership card...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !member) {
    return (
      <PublicLayout>
        <div className="bg-zinc-100 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="text-center max-w-md">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Member Not Found</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'This membership card is not available or has expired.'}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-zinc-100 flex items-center justify-center p-4 py-8">
        <div className="max-w-3xl w-full overflow-x-auto">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary font-heading uppercase tracking-wider">
            የ አባልነት መታወቂያ ካርድ
          </h1>
          
          <div 
            ref={cardRef} 
            className="relative w-full rounded-xl overflow-hidden shadow-2xl border-2 border-[#8B1A1A]"
            style={{ backgroundColor: '#F5F0E8', width: '540px', height: '340px' }}
          >
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
                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div 
                  className="px-2 py-0.5 rounded-md text-center"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <p className="text-[7px] uppercase tracking-wider text-white/80">ID</p>
                  <p className="font-mono font-bold text-[10px] text-white">{member.membershipNumber}</p>
                </div>
              </div>

              <div className="flex-1 space-y-0.5">
                <p className="font-bold text-sm leading-tight text-[#333] mb-0.5">{member.fullName}</p>
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
                <div className="p-1 bg-white rounded shadow-sm mt-1">
                  <QRCode 
                    value={`https://mechalfc.com/card/${member.membershipNumber}`} 
                    size={42}
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: '#8B1A1A' }}>
              <div className="text-white text-[9px] space-y-0">
                <p>ያገልግልበት ቀን: {member.expiryDate ? formatDate(member.expiryDate) : 'N/A'}</p>
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
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              ይህን QR ኮድ በስታዲየም ለቅድሚያ ተደራሽነት ያሳዩ
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownloadPNG}
                data-testid="button-download-png"
              >
                <FileImage className="mr-2 h-4 w-4" /> Download PNG
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
        </div>
      </div>
    </PublicLayout>
  );
}
