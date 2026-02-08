import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Missing Email',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/member/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

      setEmailSent(true);
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
              Enter your email to receive a password reset link
            </p>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4" data-testid="text-email-sent">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Check Your Email</h3>
                <p className="text-muted-foreground text-sm">
                  If an account with that email exists, we've sent a password reset link. 
                  Please check your inbox and spam folder.
                </p>
                <p className="text-xs text-muted-foreground">
                  The link will expire in 1 hour.
                </p>
                <div className="pt-4">
                  <Link href="/member/login">
                    <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        data-testid="input-reset-email"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid="button-send-reset"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
                
                <div className="mt-6 text-center text-sm">
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
