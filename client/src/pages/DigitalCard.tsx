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
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `membership-card-${member.membershipNumber}.png`;
    link.href = canvas.toDataURL('image/png');
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
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary font-heading uppercase tracking-wider">
            የ አባልነት መታወቂያ ካርድ
          </h1>
          
          <div 
            ref={cardRef} 
            className="relative w-full rounded-xl overflow-hidden shadow-2xl border-2 border-[#8B1A1A]"
            style={{ backgroundColor: '#F5F0E8' }}
          >
            <div className="px-5 py-3 text-center text-white" style={{ backgroundColor: '#8B1A1A' }}>
              <p className="font-heading text-base font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
              <p className="text-[11px] tracking-wider opacity-90">የጠቅላላ ጉባዔ ጥሪ ካርድ</p>
            </div>

            <svg className="absolute left-0 right-0 w-full" style={{ top: '50px', height: '200px', zIndex: 1 }} viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M0,120 Q100,60 200,100 T400,80 L400,95 Q300,135 200,115 T0,135 Z" fill="#228B22" opacity="0.9"/>
              <path d="M0,135 Q100,75 200,115 T400,95 L400,110 Q300,150 200,130 T0,150 Z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M0,150 Q100,90 200,130 T400,110 L400,125 Q300,165 200,145 T0,165 Z" fill="#DC143C" opacity="0.9"/>
            </svg>

            <div className="relative px-5 pt-4 pb-3" style={{ zIndex: 2 }}>
              <div className="flex gap-4 items-start">
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0 shadow-md">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-2">
                    <div 
                      className="inline-block px-2 py-1 rounded-md"
                      style={{ backgroundColor: '#DC143C' }}
                    >
                      <span className="text-[7px] uppercase tracking-wider text-white/80">ID</span>
                      <p className="font-mono font-bold text-[11px] text-white">{member.membershipNumber}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm leading-tight text-[#333]">{member.fullName}</p>
                </div>

                {brandingSettings.stamp && (
                  <div className="flex-shrink-0" style={{ width: '70px', height: '70px' }}>
                    <img 
                      src={brandingSettings.stamp} 
                      alt="Stamp" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="relative px-5 pb-3 space-y-1" style={{ zIndex: 2 }}>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">መአረግ / Rank</span>
                  <p className="text-xs font-semibold text-[#333] leading-tight">{member.rank || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">ዖታ / Sex</span>
                  <p className="text-xs font-semibold text-[#333] leading-tight">{member.gender || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">አድራሻ / Address</span>
                  <p className="text-xs font-semibold text-[#333] leading-tight">{member.address || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">ክፈለ ጦር/እዝ / Division</span>
                  <p className="text-xs font-semibold text-[#333] leading-tight">{member.division || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">ስልክ ቁጥር / Phone</span>
                  <p className="text-xs font-semibold text-[#333] leading-tight">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#DC143C] text-xs mt-0.5">★</span>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">የ ደጋፊነት ደረጃ / Level</span>
                  <p className="text-xs font-bold text-[#333] leading-tight capitalize">{member.tier}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-2 flex items-center justify-between" style={{ backgroundColor: '#8B1A1A' }}>
              <div className="text-white text-[10px] space-y-0.5">
                <p>ያገልግልበት ቀን: {member.expiryDate ? formatDate(member.expiryDate) : 'N/A'}</p>
              </div>
              {(brandingSettings.signature || brandingSettings.authorizedPersonName) && (
                <div className="text-center">
                  {brandingSettings.signature && (
                    <img 
                      src={brandingSettings.signature} 
                      alt="Authorized Signature" 
                      className="h-7 mx-auto mb-0.5"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                    />
                  )}
                  {brandingSettings.authorizedPersonName && (
                    <p className="text-[8px] text-white/70">{brandingSettings.authorizedPersonName}</p>
                  )}
                </div>
              )}
              <div className="p-1 rounded bg-white">
                <QRCode 
                  value={`https://mechalfc.com/card/${member.membershipNumber}`} 
                  size={50}
                />
              </div>
            </div>

            <div className="text-center py-2" style={{ backgroundColor: '#8B1A1A' }}>
              <p className="text-white font-heading text-xs font-bold tracking-wide">መቻል ስፖርት ክለብ የደጋፊዎች ማህበር</p>
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
