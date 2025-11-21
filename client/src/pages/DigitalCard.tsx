import PublicLayout from '@/components/PublicLayout';
import { useApp } from '@/lib/context';
import { MOCK_MEMBER, ASSETS } from '@/lib/mockData';
import QRCode from 'react-qr-code';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DigitalCard() {
  const [match, params] = useRoute('/card/:membershipId');
  const { user } = useApp();
  
  // In a real app, fetch member by ID. Here use mock.
  const member = MOCK_MEMBER;

  return (
    <PublicLayout>
      <div className="bg-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary font-heading uppercase tracking-wider">
            Official Member Card
          </h1>
          
          {/* The Digital Card */}
          <div className="relative aspect-[1.586/1] w-full rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-black">
               {/* Texture overlay */}
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              {/* Header */}
              <div className="flex justify-between items-start">
                <img src={ASSETS.logo} alt="Logo" className="h-16 w-16 object-contain drop-shadow-md" />
                <div className="text-right">
                  <h2 className="font-heading text-2xl font-bold leading-none">FASIL KENEMA</h2>
                  <p className="text-xs opacity-80 tracking-widest uppercase">Sport Club</p>
                </div>
              </div>
              
              {/* Member Details */}
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-[10px] uppercase opacity-70 tracking-wider mb-1">Member Name</p>
                  <p className="font-display text-xl tracking-wide uppercase">{member.firstName} {member.lastName}</p>
                  
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-[10px] uppercase opacity-70 tracking-wider mb-1">ID Number</p>
                      <p className="font-mono text-sm">{member.membershipId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-70 tracking-wider mb-1">Valid Thru</p>
                      <p className="font-mono text-sm">{member.expiryDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="bg-white p-2 rounded">
                  <QRCode 
                    value={`https://fasilkenema.com/verify/${member.membershipId}`} 
                    size={80}
                  />
                </div>
              </div>
              
              {/* Tier Badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
                <img src={ASSETS.logo} className="w-64 h-64 grayscale invert" />
              </div>
              
               <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                 <span className="bg-yellow-500/90 text-black px-3 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-sm border border-yellow-300/50">
                   {member.tier} Member
                 </span>
               </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Show this QR code at the stadium entrance for priority access.
            </p>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              Print Card
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
