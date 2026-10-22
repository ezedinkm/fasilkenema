import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ASSETS } from "@/lib/mockData";
import { Loader2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setLocation("/admin/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-red-600 relative overflow-hidden px-4 py-8 pt-safe pb-safe">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black pointer-events-none"></div> */}

      <Card className="w-full max-w-md relative z-10 shadow-sm">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-16 h-16 mb-4  rounded-full flex items-center justify-center border border-white/10">
            <img src={ASSETS.logo} alt="Logo" className="object-cover" />
          </div>
          <CardTitle className="text-lg sm:text-2xl font-heading uppercase tracking-wide sm:tracking-widest text-red-600 leading-tight">
            FASIL FC ADMIN PANEL
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access the admin panel
          </CardDescription>
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
                  className="bg-white border-red-600 focus-visible:ring-red-600 pl-10"
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
                  className="bg-white border-red-600 focus-visible:ring-red-600 pl-10"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-display uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setLocation("/admin/forgot-password")}
              className="text-sm font-medium text-red-700 hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-zinc-500 justify-center text-red-600">
          Authorized Personnel Only • FASIL FC
        </CardFooter>
      </Card>
    </div>
  );
}
