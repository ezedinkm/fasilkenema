import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function MembershipSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [memberCreated, setMemberCreated] = useState(false);

  useEffect(() => {
    const verifyAndCreateMember = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const txRef = params.get('trx_ref');
        
        if (!txRef) {
          toast({
            title: 'Error',
            description: 'Missing transaction reference',
            variant: 'destructive',
          });
          setIsVerifying(false);
          return;
        }

        const verifyResponse = await fetch(`/api/chapa/verify/${txRef}`);
        const verifyData = await verifyResponse.json();

        if (verifyData.error) {
          toast({
            title: 'Payment Verification Failed',
            description: verifyData.error,
            variant: 'destructive',
          });
          setIsVerifying(false);
          return;
        }

        if (verifyData.status === 'success') {
          setPaymentVerified(true);

          const tier = params.get('tier');
          const firstName = params.get('firstName');
          const lastName = params.get('lastName');
          const email = params.get('email');
          const phone = params.get('phone');
          const dob = params.get('dob');
          const city = params.get('city');
          const country = params.get('country');

          if (!tier || !firstName || !lastName || !email || !phone || !dob || !city || !country) {
            toast({
              title: 'Error',
              description: 'Missing member information. Please contact support.',
              variant: 'destructive',
            });
            setIsVerifying(false);
            return;
          }

          const createMemberResponse = await fetch('/api/members', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: decodeURIComponent(firstName),
              lastName: decodeURIComponent(lastName),
              email: decodeURIComponent(email),
              phone: decodeURIComponent(phone),
              dateOfBirth: decodeURIComponent(dob),
              city: decodeURIComponent(city),
              country: decodeURIComponent(country),
              membershipTier: tier,
              status: 'active',
            }),
          });

          const memberData = await createMemberResponse.json();

          if (memberData.error) {
            toast({
              title: 'Member Creation Failed',
              description: memberData.error,
              variant: 'destructive',
            });
            setIsVerifying(false);
            return;
          }

          setMemberCreated(true);
        } else {
          toast({
            title: 'Payment Not Completed',
            description: 'Your payment was not successful. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify payment. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndCreateMember();
  }, [toast]);

  if (isVerifying) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground">Verifying your payment...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!paymentVerified || !memberCreated) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <Card className="border-t-4 border-t-destructive">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Payment Issue</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>There was an issue processing your membership. Please contact our support team.</p>
              <Button onClick={() => setLocation('/membership')} data-testid="button-back-membership">
                Back to Membership Options
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container px-4 py-16 max-w-2xl mx-auto">
        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-20 h-20 text-primary" />
            </div>
            <CardTitle className="text-center font-display text-3xl">Welcome to The Family!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-xl">
              Your membership registration was successful. You are now an official member of the Fasil Kenema Fan Club!
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-2">
              <p className="font-semibold">What's Next?</p>
              <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                <li>✓ Check your email for your membership confirmation</li>
                <li>✓ Your digital membership card will be sent to you shortly</li>
                <li>✓ You'll receive exclusive updates and benefits</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                data-testid="button-home"
              >
                Go to Home
              </Button>
              <Button 
                onClick={() => setLocation('/contact')}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-contact"
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
