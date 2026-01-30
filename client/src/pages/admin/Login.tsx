import { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ASSETS } from '@/lib/mockData';
import { Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { adminLogin } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await adminLogin(email, password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Welcome, Admin",
        description: "Access granted to the command center.",
      });
      setLocation('/admin/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black pointer-events-none"></div>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 backdrop-blur-xl text-white relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-16 h-16 mb-4 bg-black/50 rounded-full flex items-center justify-center border border-white/10">
            <img src={ASSETS.logo} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <CardTitle className="text-2xl font-heading uppercase tracking-widest text-primary">Command Center</CardTitle>
          <CardDescription className="text-zinc-400">Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary pl-10"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary pl-10"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-display uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-zinc-500 justify-center">
          Authorized Personnel Only • Mechal FC
        </CardFooter>
      </Card>
    </div>
  );
}
