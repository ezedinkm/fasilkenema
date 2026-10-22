import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Lock } from "lucide-react";
import { ASSETS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AdminRecoveryLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen-safe items-center justify-center overflow-hidden bg-red-600 px-4 py-8 pt-safe pb-safe">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <Card className="relative z-10 w-full max-w-md shadow-sm">
        <CardHeader className="space-y-2 pb-3 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
            <img src={ASSETS.logo} alt="Fasil FC" className="object-cover" />
          </div>
          <CardTitle className="text-lg font-heading uppercase tracking-wide text-red-600 sm:text-2xl sm:tracking-widest">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

export function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not send the reset request.");
      }
      setMessage(
        result.message ||
          "If an active Super Admin account exists for that email, reset instructions will be sent.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send the reset request. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminRecoveryLayout
      title="Forgot Password"
      description="Request a secure password reset link for the Super Admin account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-recovery-email">Super Admin email</Label>
          <div className="relative">
            <Input
              id="admin-recovery-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="border-red-600 pl-10 focus-visible:ring-red-600"
            />
            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          </div>
        </div>
        {message && (
          <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-red-600 text-white hover:bg-red-700"
          disabled={isLoading || !email.trim()}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
        <p className="text-center text-sm text-zinc-600">
          <Link href="/admin/login" className="font-semibold text-red-700 hover:underline">
            Back to admin login
          </Link>
        </p>
      </form>
    </AdminRecoveryLayout>
  );
}

export function AdminResetPassword() {
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing or invalid. Request a new link.");
      return;
    }
    if (password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not reset the password.");
      }
      setPassword("");
      setConfirmPassword("");
      setIsComplete(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not reset the password. Request a new link and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminRecoveryLayout
      title="Reset Password"
      description="Choose a new password for the Super Admin account."
    >
      {isComplete ? (
        <div className="space-y-4 text-center">
          <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Your password has been reset. You can now sign in with the new password.
          </p>
          <Button
            className="w-full bg-red-600 text-white hover:bg-red-700"
            onClick={() => setLocation("/admin/login")}
          >
            Go to admin login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!token && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              This reset link is missing or invalid. Request a new link to continue.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="admin-new-password">New password</Label>
            <Input
              id="admin-new-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={200}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password">Confirm new password</Label>
            <Input
              id="admin-confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={200}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-red-600 text-white hover:bg-red-700"
            disabled={isLoading || !token}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save new password
          </Button>
          <p className="text-center text-sm text-zinc-600">
            <Link href="/admin/login" className="font-semibold text-red-700 hover:underline">
              Back to admin login
            </Link>
          </p>
        </form>
      )}
    </AdminRecoveryLayout>
  );
}
