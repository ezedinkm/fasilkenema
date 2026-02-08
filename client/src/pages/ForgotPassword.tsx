import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { Phone, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'done'>('phone');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast({
        title: 'Missing Phone',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/member/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to process request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'OTP Sent',
        description: 'A verification code has been sent to your phone',
      });
      setStep('otp');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the OTP code and new password',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/member/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to reset password',
          variant: 'destructive',
        });
        return;
      }

      setStep('done');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container px-4 py-16 max-w-md mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary" data-testid="text-forgot-password-title">
              Forgot Password
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {step === 'phone' && 'Enter your phone number to receive a verification code'}
              {step === 'otp' && 'Enter the OTP code sent to your phone'}
              {step === 'done' && 'Your password has been reset'}
            </p>
          </CardHeader>
          <CardContent>
            {step === 'done' ? (
              <div className="text-center space-y-4" data-testid="text-reset-success">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Password Reset Successful</h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been updated. You can now login with your new password.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => setLocation('/member/login')} 
                    className="w-full bg-primary hover:bg-primary/90" 
                    data-testid="button-go-to-login"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : step === 'phone' ? (
              <>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">ስልክ ቁጥር / Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="09xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        data-testid="input-reset-phone"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid="button-send-otp"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP Code'}
                  </Button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                  <Link href="/member/login" className="text-primary hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">OTP Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                        data-testid="input-otp"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Code expires in 5 minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid="button-reset-password"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isLoading}
                    data-testid="button-resend-otp"
                  >
                    Resend OTP Code
                  </Button>
                </form>
                
                <div className="mt-4 text-center text-sm">
                  <Link href="/member/login" className="text-primary hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
