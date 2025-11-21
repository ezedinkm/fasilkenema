import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MembershipCard from '@/components/MembershipCard';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Membership() {
  const [currency, setCurrency] = useState<'etb' | 'usd'>('etb');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-primary py-20 text-white text-center">
          <div className="container px-4">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">Join The Family</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Support Fasil Kenema FC directly and enjoy exclusive benefits. Your membership fuels our success on the pitch.
            </p>
          </div>
        </div>

        <div className="container px-4 py-12">
          {/* Currency Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <Label htmlFor="currency-mode" className={`text-lg font-bold ${currency === 'etb' ? 'text-primary' : 'text-muted-foreground'}`}>ETB</Label>
            <Switch 
              id="currency-mode" 
              checked={currency === 'usd'} 
              onCheckedChange={(checked) => setCurrency(checked ? 'usd' : 'etb')} 
            />
            <Label htmlFor="currency-mode" className={`text-lg font-bold ${currency === 'usd' ? 'text-primary' : 'text-muted-foreground'}`}>USD</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {MEMBERSHIP_TIERS.map(tier => (
              <MembershipCard key={tier.id} tier={tier} currency={currency} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
