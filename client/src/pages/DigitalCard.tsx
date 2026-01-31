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
      <div className="bg-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary font-heading uppercase tracking-wider">
            Official Member Card
          </h1>
          
          <div 
            ref={cardRef} 
            className="relative aspect-[1.586/1] w-full rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-300"
            style={{ backgroundColor: '#228B22' }}
          >
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom right, #228B22, #1a6b1a, #0d3d0d)' }}
            >
            </div>
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between" style={{ color: '#ffffff' }}>
              <div className="flex justify-between items-start">
                <img src={ASSETS.logo} alt="Logo" className="h-16 w-16 object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                <div className="text-right">
                  <h2 className="font-heading text-2xl font-bold leading-none" style={{ color: '#ffffff' }}>{brandingSettings.headerText}</h2>
                  <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{brandingSettings.headerSubtext}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div className="flex items-end gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden border-2 border-white/50 flex-shrink-0">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Member Name</p>
                    <p className="font-display text-lg tracking-wide uppercase" style={{ color: '#ffffff' }}>{member.fullName}</p>
                    
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ID Number</p>
                        <p className="font-mono text-xs" style={{ color: '#ffffff' }}>{member.membershipNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Valid Thru</p>
                        <p className="font-mono text-xs" style={{ color: '#ffffff' }}>{member.expiryDate ? formatDate(member.expiryDate) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#ffffff' }}>
                  <QRCode 
                    value={`https://mechalfc.com/verify/${member.membershipNumber}`} 
                    size={70}
                  />
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ transform: 'translate(-50%, -50%)', opacity: 0.1 }}>
                <img src={ASSETS.logo} className="w-64 h-64" style={{ filter: 'grayscale(1) invert(1)' }} />
              </div>
              
               <div className="absolute bottom-6 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                 <span 
                   className="px-3 py-1 rounded text-xs font-bold uppercase tracking-widest"
                   style={{ backgroundColor: '#DC143C', color: '#ffffff', border: '1px solid rgba(220, 20, 60, 0.7)' }}
                 >
                   {member.tier} Member
                 </span>
               </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Show this QR code at the stadium entrance for priority access.
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
