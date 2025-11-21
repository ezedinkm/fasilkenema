import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';

export default function MembershipRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<typeof MEMBERSHIP_TIERS[0] | null>(null);
  const [currency, setCurrency] = useState<'etb' | 'usd'>('etb');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierId = params.get('tier');
    const currencyParam = params.get('currency') as 'etb' | 'usd';
    
    if (tierId) {
      const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
      if (tier) {
        setSelectedTier(tier);
        if (currencyParam) {
          setCurrency(currencyParam);
        }
      } else {
        setLocation('/membership');
      }
    } else {
      setLocation('/membership');
    }
  }, [setLocation]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !city || !country) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTier) {
      toast({
        title: 'Error',
        description: 'No membership tier selected',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amount = currency === 'etb' ? selectedTier.price.etb : selectedTier.price.usd;
      
      const paymentData = {
        amount,
        currency: currency.toUpperCase(),
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        city,
        country,
        membershipTier: selectedTier.id,
      };

      const response = await fetch('/api/members/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setIsSubmitting(false);
      } else if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process registration. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (!selectedTier) {
    return null;
  }

  const price = currency === 'etb' 
    ? `${selectedTier.price.etb} ETB` 
    : `$${selectedTier.price.usd} USD`;

  return (
    <PublicLayout>
      <div className="bg-zinc-50">
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-primary mb-4">Join The Family</h1>
            <p className="text-xl text-muted-foreground">
              Complete your {selectedTier.name} membership registration
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">
                {selectedTier.name} Membership - {price}/year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name *" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                    <Input 
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                  <Input 
                    placeholder="Email Address *" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                  <Input 
                    placeholder="Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date of Birth *</label>
                    <Input 
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Location</h3>
                <div className="space-y-4">
                  <Input 
                    placeholder="City *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-testid="input-city"
                  />
                  <Input 
                    placeholder="Country *"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    data-testid="input-country"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
                  data-testid="button-proceed-payment"
                >
                  {isSubmitting ? 'Processing...' : `Proceed to Payment - ${price}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  You will be redirected to secure Chapa payment gateway
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
