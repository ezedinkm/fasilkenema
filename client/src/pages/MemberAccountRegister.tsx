import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function MemberAccountRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !identifier.trim()) {
      toast({ title: "Enter your name and contact", variant: "destructive" });
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      toast({
        title: password.length < 6 ? "Password is too short" : "Passwords do not match",
        description: "Use at least six characters and enter the same password twice.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!codeSent) {
        const response = await fetch("/api/member/registration/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, identifier: identifier.trim() }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Could not send the verification code.");
        setCodeSent(true);
        toast({ title: "Verification code sent", description: `Check your ${method}.` });
        return;
      }

      if (!/^\d{6}$/.test(code.trim())) {
        throw new Error("Enter the six-digit verification code.");
      }
      const verifyResponse = await fetch("/api/member/registration/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, identifier: identifier.trim(), code: code.trim() }),
      });
      const verifyResult = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || "Could not verify your contact.");
      }

      const response = await fetch("/api/member/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          method,
          identifier: identifier.trim(),
          password,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not create your account.");
      }
      localStorage.setItem("memberToken", result.token);
      localStorage.setItem("memberData", JSON.stringify(result.account));
      setLocation("/member/members");
    } catch (error) {
      toast({
        title: "Account setup failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="container mx-auto max-w-xl px-4 py-12">
        <Card className="border-t-4 border-t-red-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-700">Create a membership account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage memberships for family members or other people. You do not need to buy a membership for yourself.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
            <Input
              autoComplete="name"
              placeholder="Account owner name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <label className="block text-sm font-medium">
              Sign up with
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3"
                value={method}
                onChange={(event) => {
                  setMethod(event.target.value as "phone" | "email");
                  setCodeSent(false);
                  setCode("");
                }}
              >
                <option value="phone">Phone number</option>
                <option value="email">Email address</option>
              </select>
            </label>
            <Input
              autoComplete={method === "phone" ? "tel" : "email"}
              type={method === "phone" ? "tel" : "email"}
              placeholder={method === "phone" ? "09xxxxxxxx or +251…" : "Email address"}
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setCodeSent(false);
                setCode("");
              }}
            />
            {codeSent && (
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Six-digit verification code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              />
            )}
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Password (at least 6 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <Button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? codeSent ? "Creating account…" : "Sending code…"
                : codeSent ? "Verify and create account" : "Send verification code"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" className="font-medium text-red-700 hover:underline" onClick={() => setLocation("/member/login")}>
                Sign in
              </button>
            </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </PublicLayout>
  );
}
