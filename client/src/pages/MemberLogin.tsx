import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Phone, Mail } from "lucide-react";

export default function MemberLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${contactMethod === "phone" ? "phone number" : "email address"} and password`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/member/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            method: contactMethod,
            identifier:
              contactMethod === "phone" ? phone : phone.trim().toLowerCase(),
            password,
          }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsPasswordSetup) {
          toast({
            title: "Password Setup Required",
            description: "Redirecting you to set up your password...",
          });
          setTimeout(() => setLocation("/member/forgot-password"), 1500);
          return;
        }
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("memberToken", result.token);
      localStorage.setItem("memberData", JSON.stringify(result.member));

      toast({
        title: "Welcome Back!",
        description: `Logged in as ${result.member.fullName}`,
      });

      setLocation("/member/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
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
            <CardTitle
              className="text-2xl font-bold text-red-600"
              data-testid="text-login-title"
            >
              Member Login
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Access your digital membership card
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sign in using
                </label>
                <select
                  value={contactMethod}
                  onChange={(e) =>
                    setContactMethod(e.target.value as "phone" | "email")
                  }
                  className="mb-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="select-login-method"
                >
                  <option value="phone">Phone number</option>
                  <option value="email">Email address</option>
                </select>
                <label className="text-sm font-medium mb-2 block">
                  {contactMethod === "phone"
                    ? "ስልክ ቁጥር / Phone Number"
                    : "Email address"}
                </label>
                <div className="relative">
                  {contactMethod === "phone" ? (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    type={contactMethod === "phone" ? "tel" : "email"}
                    autoComplete={contactMethod === "phone" ? "tel" : "email"}
                    placeholder={
                      contactMethod === "phone" ? "09xxxxxxxx" : "you@example.com"
                    }
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    data-testid="input-login-identifier"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Password
                </label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-right">
                <Link
                  href="/member/forgot-password"
                  className="text-sm text-red-600 hover:underline"
                  data-testid="link-forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Not a member yet?{" "}
                <Link
                  href="/membership"
                  className="text-primary hover:underline"
                >
                  Join Now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
