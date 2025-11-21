import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Heart } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { verifyPayment } from '@/lib/api';

export default function DonateSuccess() {
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const txRef = urlParams.get('trx_ref') || urlParams.get('tx_ref');

    if (txRef) {
      verifyPayment(txRef)
        .then((result) => {
          if (result.success && result.status === 'success') {
            setPaymentStatus('success');
          } else {
            setPaymentStatus('failed');
          }
        })
        .catch(() => {
          setPaymentStatus('failed');
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } else {
      setPaymentStatus('failed');
      setIsVerifying(false);
    }
  }, []);

  return (
    <PublicLayout>
      <div className="bg-zinc-50 min-h-[60vh] flex items-center justify-center py-16">
        <div className="container px-4 max-w-2xl">
          {isVerifying ? (
            <Card className="text-center p-12">
              <CardContent className="space-y-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <h2 className="text-2xl font-heading font-bold">Verifying Payment...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your donation.</p>
              </CardContent>
            </Card>
          ) : paymentStatus === 'success' ? (
            <Card className="text-center p-12 border-t-4 border-t-green-500">
              <CardContent className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-heading font-bold text-green-700 mb-4">Thank You!</h1>
                  <p className="text-xl text-muted-foreground mb-2">Your donation has been received successfully.</p>
                  <p className="text-muted-foreground">
                    Your support helps Fasil Kenema FC continue to excel on and off the pitch. The Emperors thank you!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Heart className="h-6 w-6 fill-current" />
                  <span className="text-lg font-bold">You're now part of our journey!</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/membership">
                    <Button size="lg" className="w-full sm:w-auto bg-primary">
                      Become a Member
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-12 border-t-4 border-t-red-500">
              <CardContent className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
                <div>
                  <h1 className="text-4xl font-heading font-bold text-red-700 mb-4">Payment Failed</h1>
                  <p className="text-xl text-muted-foreground mb-2">We couldn't process your donation.</p>
                  <p className="text-muted-foreground">
                    Please try again or contact us if you continue to experience issues.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/donate">
                    <Button size="lg" className="w-full sm:w-auto bg-primary">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
