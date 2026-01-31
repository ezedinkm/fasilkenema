import PublicLayout from '@/components/PublicLayout';
import MembershipCard from '@/components/MembershipCard';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getSettingByKey } from '@/lib/api';

interface MembershipTier {
  id: string;
  name: string;
  price: { etb: number; usd: number };
  benefits: string[];
  color: string;
  recommended: boolean;
}

export default function Membership() {
  const [currency, setCurrency] = useState<'etb' | 'usd'>('etb');
  const [tiers, setTiers] = useState<MembershipTier[]>(MEMBERSHIP_TIERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const result = await getSettingByKey('membership_tiers');
        if (result?.value && Array.isArray(result.value)) {
          const dbTiers = result.value.map((tier: any, index: number) => ({
            id: tier.id || tier.name?.toLowerCase() || `tier-${index}`,
            name: tier.name,
            price: { 
              etb: tier.priceETB || tier.price?.etb || 0, 
              usd: tier.priceUSD || tier.price?.usd || 0 
            },
            benefits: tier.benefits || [],
            color: tier.color || (index === 1 ? 'bg-primary text-black' : index === 2 ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-900'),
            recommended: tier.recommended || index === 1,
          }));
          setTiers(dbTiers);
        }
      } catch (error) {
        console.error('Failed to fetch membership tiers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTiers();
  }, []);

  return (
    <PublicLayout>
      <div className="bg-primary py-20 text-white text-center">
        <div className="container px-4">
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">Join The Family</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Support Mechal FC directly and enjoy exclusive benefits. Your membership fuels our success on the pitch.
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

        {loading ? (
          <div className="text-center py-12">Loading membership options...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map(tier => (
              <MembershipCard key={tier.id} tier={tier} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
