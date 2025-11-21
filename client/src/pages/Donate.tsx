import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { initializeDonationPayment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Donate() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const finalAmount = amount === 'custom' ? customAmount : amount;
    
    const amountNum = parseInt(finalAmount);
    if (!finalAmount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please select or enter a valid donation amount',
        variant: 'destructive',
      });
      return;
    }

    if (!firstName || !lastName || !email || !phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all donor details',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const paymentData = {
        amount: amountNum,
        currency: 'ETB',
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        isAnonymous: isAnonymous,
      };

      const result = await initializeDonationPayment(paymentData);
      
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
        description: 'Failed to process donation. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-zinc-50">
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-primary mb-4">Make a Donation</h1>
            <p className="text-xl text-muted-foreground">
              Your voluntary contributions help us improve facilities, youth academies, and community programs in Gondar.
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {['100', '500', '1000', '5000', '10000'].map((val) => (
                  <Button 
                    key={val} 
                    variant="outline" 
                    className={`h-16 text-xl font-bold hover:border-primary hover:text-primary ${amount === val ? 'border-primary text-primary bg-primary/5' : ''}`}
                    onClick={() => setAmount(val)}
                    data-testid={`button-amount-${val}`}
                  >
                    {val} ETB
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  className={`h-16 text-xl font-bold hover:border-primary hover:text-primary ${amount === 'custom' ? 'border-primary text-primary bg-primary/5' : ''}`}
                  onClick={() => setAmount('custom')}
                  data-testid="button-amount-custom"
                >
                  Custom
                </Button>
              </div>

              {amount === 'custom' && (
                <div className="pt-2">
                  <label className="text-sm font-medium mb-2 block">Enter Custom Amount (ETB)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="text-lg h-12"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    data-testid="input-custom-amount"
                  />
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <h3 className="font-bold mb-4">Donor Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                    <Input 
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                  <Input 
                    placeholder="Email Address" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                  <Input 
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="anonymous" 
                      className="rounded border-gray-300"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      data-testid="checkbox-anonymous"
                    />
                    <label htmlFor="anonymous" className="text-sm">Make this donation anonymous</label>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-display uppercase tracking-wider bg-primary hover:bg-primary/90 mt-4"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-proceed-payment"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
