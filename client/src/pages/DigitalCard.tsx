import PublicLayout from '@/components/PublicLayout';
import { useApp } from '@/lib/context';
import { MOCK_MEMBER, ASSETS } from '@/lib/mockData';
import QRCode from 'react-qr-code';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileImage, FileText } from 'lucide-react';

export default function DigitalCard() {
  const [match, params] = useRoute('/card/:membershipId');
  const { user } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `membership-card-${MOCK_MEMBER.membershipId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
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
    pdf.save(`membership-card-${MOCK_MEMBER.membershipId}.pdf`);
  };
  
  const { data: branding } = useQuery<any[]>({
    queryKey: ['/api/public/branding'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'ST GEORGE',
    headerSubtext: (Array.isArray(branding) ? branding.find((s: any) => s.key === 'branding.headerSubtext')?.value : null) || 'SPORT CLUB',
  };
  
  const member = MOCK_MEMBER;

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
            style={{ backgroundColor: '#78350f' }}
          >
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom right, #78350f, #92400e, #1a1a1a)' }}
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
                <div>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Member Name</p>
                  <p className="font-display text-xl tracking-wide uppercase" style={{ color: '#ffffff' }}>{member.firstName} {member.lastName}</p>
                  
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ID Number</p>
                      <p className="font-mono text-sm" style={{ color: '#ffffff' }}>{member.membershipId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Valid Thru</p>
                      <p className="font-mono text-sm" style={{ color: '#ffffff' }}>{member.expiryDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#ffffff' }}>
                  <QRCode 
                    value={`https://stgeorgefc.com/verify/${member.membershipId}`} 
                    size={80}
                  />
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ transform: 'translate(-50%, -50%)', opacity: 0.1 }}>
                <img src={ASSETS.logo} className="w-64 h-64" style={{ filter: 'grayscale(1) invert(1)' }} />
              </div>
              
               <div className="absolute bottom-6 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                 <span 
                   className="px-3 py-1 rounded text-xs font-bold uppercase tracking-widest"
                   style={{ backgroundColor: 'rgba(234, 179, 8, 0.9)', color: '#000000', border: '1px solid rgba(253, 224, 71, 0.5)' }}
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
