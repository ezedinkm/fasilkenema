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
            className="relative w-full rounded-xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: '#228B22' }}
          >
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, #228B22 0%, #228B22 30%, #FFD700 50%, #DC143C 70%, #DC143C 100%)' }}
            />
            
            {brandingSettings.stamp && (
              <div 
                className="absolute pointer-events-none"
                style={{ 
                  bottom: '55px',
                  right: '20px',
                  width: '100px',
                  height: '100px',
                  opacity: 0.7,
                  zIndex: 2,
                }}
              >
                <img 
                  src={brandingSettings.stamp} 
                  alt="" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            )}
            
            <div className="relative p-5 text-white">
              <div className="flex flex-col items-center mb-3">
                <img src={ASSETS.logo} alt="Logo" className="h-14 w-14 object-contain mb-1" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                <h2 className="font-heading text-lg font-bold leading-none">{brandingSettings.headerText}</h2>
                <p className="text-[10px] tracking-widest uppercase opacity-70">{brandingSettings.headerSubtext}</p>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#DC143C', color: '#ffffff' }}
                >
                  {member.tier}
                </span>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-24 rounded-lg bg-white/20 overflow-hidden border-2 border-white/40 flex-shrink-0">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-50">ሙሉ ስም</span>
                    <p className="font-bold text-sm leading-tight">{member.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-50">መአረግ</span>
                    <p className="text-xs font-medium leading-tight">{member.rank || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-50">ዖታ</span>
                    <p className="text-xs font-medium leading-tight">{member.gender || '—'}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider opacity-50">አድራሻ</span>
                  <p className="font-medium leading-tight">{member.address || '—'}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider opacity-50">ክፈለ ጦር/እዝ</span>
                  <p className="font-medium leading-tight">{member.division || '—'}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider opacity-50">ስልክ ቁጥር</span>
                  <p className="font-medium leading-tight">{member.phone}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider opacity-50">የ ደጋፊነት ደረጃ</span>
                  <p className="font-bold leading-tight capitalize">{member.tier}</p>
                </div>
              </div>
              
              <div className="flex items-end justify-between pt-2 border-t border-white/20">
                <div className="space-y-1.5">
                  <div 
                    className="px-3 py-1.5 rounded-md"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    <span className="text-[8px] uppercase tracking-wider text-white/70">መታወቂያ ቁጥር / ID</span>
                    <p className="font-mono text-sm font-bold text-white">{member.membershipNumber}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-50">ያገልግልበት ቀን</span>
                    <p className="font-mono text-xs">{member.expiryDate ? formatDate(member.expiryDate) : 'N/A'}</p>
                  </div>
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
                      <p className="text-[8px] opacity-60">{brandingSettings.authorizedPersonName}</p>
                    )}
                  </div>
                )}
                
                <div className="p-1.5 rounded bg-white">
                  <QRCode 
                    value={`https://mechalfc.com/card/${member.membershipNumber}`} 
                    size={60}
                  />
                </div>
              </div>
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
