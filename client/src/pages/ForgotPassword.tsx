import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Phone, ArrowLeft, CheckCircle, KeyRound, Lock } from "lucide-react";
import {
  isValidEthiopianMobile,
  normalizeEthiopianMobileLocal,
} from "@shared/ethiopianPhone";
import { apiUrl } from "@/lib/apiUrl";

type Step = "phone" | "otp" | "password" | "done";

type ParsedApiBody = Record<string, unknown>;

async function postJson(
  url: string,
  body: unknown,
): Promise<{
  response: Response;
  result: ParsedApiBody;
  rawText: string;
  looksLikeHtml: boolean;
}> {
  const response = await fetch(apiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });

  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const looksLikeHtml =
    contentType.includes("text/html") || /^\s*</.test(rawText.slice(0, 80));

  let result: ParsedApiBody = {};
  if (rawText) {
    try {
      result = JSON.parse(rawText) as ParsedApiBody;
    } catch {
      result = {};
    }
  }

  return { response, result, rawText, looksLikeHtml };
}

function isOtpSentPayload(result: ParsedApiBody): boolean {
  const sent = result.sent;
  return sent === true || sent === "true" || sent === 1;
}

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  /** Remount password fields after OTP verify so users always type password + confirm fresh. */
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const newPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "otp") return;
    const t = window.setTimeout(() => {
      otpInputRef.current?.focus();
      otpInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "password") return;
    const t = window.setTimeout(() => {
      newPasswordRef.current?.focus();
      newPasswordRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    return () => window.clearTimeout(t);
  }, [step, passwordFormKey]);

  const handleSendOtp = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast({
        title: "Missing Phone",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEthiopianMobile(phone)) {
      toast({
        title: "Invalid phone number",
        description:
          "Use an Ethiopian mobile number: 09xxxxxxxx or 07xxxxxxxx (or +251…).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const phoneKey = normalizeEthiopianMobileLocal(phone.trim());
    if (!phoneKey) {
      setIsLoading(false);
      toast({
        title: "Invalid phone number",
        description:
          "Use an Ethiopian mobile number: 09xxxxxxxx or 07xxxxxxxx (or +251…).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { response, result, rawText, looksLikeHtml } = await postJson(
        "/api/member/forgot-password",
        {
          phone: phoneKey,
        },
      );

      if (looksLikeHtml) {
        toast({
          title: "Could not reach the server",
          description:
            "The app received a web page instead of the API. Open the site from your backend URL, or set VITE_API_BASE_URL if the API is on another host.",
          variant: "destructive",
        });
        return;
      }

      const otpSent = isOtpSentPayload(result);

      if (response.ok && otpSent) {
        setOtp("");
        setStep("otp");
        toast({
          title: "Code sent",
          description:
            (typeof result.message === "string" && result.message) ||
            "Enter the verification code from your SMS below.",
        });
        return;
      }

      if (!response.ok) {
        const desc =
          typeof result.error === "string"
            ? result.error
            : typeof result.message === "string"
              ? result.message
              : rawText && rawText.length < 200
                ? rawText
                : "We could not complete that request. Please try again.";
        const title =
          response.status === 502
            ? "Could not send SMS"
            : response.status === 400
              ? "Invalid request"
              : "Something went wrong";
        toast({ title, description: desc, variant: "destructive" });
        return;
      }

      toast({
        title: "No code sent",
        description:
          (typeof result.message === "string" && result.message) ||
          "This number is not registered as a member, so no SMS was sent. Use the number you signed up with or contact the club office.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = otp.trim().replace(/\s/g, "");
    if (!code) {
      toast({
        title: "Missing code",
        description: "Enter the verification code from your SMS.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit code sent by SMS.",
        variant: "destructive",
      });
      return;
    }

    const phoneKey = normalizeEthiopianMobileLocal(phone.trim());
    if (!phoneKey) {
      toast({
        title: "Invalid phone number",
        description: "Go back and enter your phone number again.",
        variant: "destructive",
      });
      setStep("phone");
      return;
    }

    setIsLoading(true);

    try {
      const { response, result, looksLikeHtml } = await postJson(
        "/api/member/forgot-password/verify-otp",
        {
          phone: phoneKey,
          otp: code,
        },
      );

      if (looksLikeHtml) {
        toast({
          title: "Could not reach the server",
          description:
            "The app received a web page instead of the API. Check VITE_API_BASE_URL or open the app from your server URL.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        setOtp("");
        toast({
          title: "Code does not match",
          description:
            typeof result.error === "string"
              ? result.error
              : "The code is wrong or expired. Use Resend to get a new SMS code.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Code verified",
        description:
          typeof result.message === "string"
            ? result.message
            : "Set your new password on the next step.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFormKey((k) => k + 1);
      setStep("password");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast({
        title: "Missing password",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const code = otp.trim().replace(/\s/g, "");
    if (!code) {
      toast({
        title: "Session expired",
        description: "Go back and enter your verification code again.",
        variant: "destructive",
      });
      setStep("otp");
      return;
    }

    const phoneKey = normalizeEthiopianMobileLocal(phone.trim());
    if (!phoneKey) {
      toast({
        title: "Invalid phone number",
        description: "Start over from the phone step.",
        variant: "destructive",
      });
      setStep("phone");
      return;
    }

    setIsLoading(true);

    try {
      const { response, result, looksLikeHtml } = await postJson(
        "/api/member/reset-password",
        {
          phone: phoneKey,
          otp: code,
          newPassword,
        },
      );

      if (looksLikeHtml) {
        toast({
          title: "Could not reach the server",
          description:
            "The app received a web page instead of the API. Check VITE_API_BASE_URL or open the app from your server URL.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: "Could not reset password",
          description:
            typeof result.error === "string"
              ? result.error
              : "Please check your code and try again.",
          variant: "destructive",
        });
        if (response.status === 422) {
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordFormKey((k) => k + 1);
          setStep("otp");
        }
        return;
      }

      setOtp("");
      toast({
        title: "Password updated",
        description:
          typeof result.message === "string"
            ? result.message
            : "You can sign in with your new password. You may receive a short confirmation SMS shortly.",
      });
      setStep("done");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepSubtitle =
    step === "phone"
      ? "Enter your phone number to receive a verification code"
      : step === "otp"
        ? "Enter the verification code sent to your phone"
        : step === "password"
          ? "Choose a new password for your account"
          : "Your password has been reset";

  const cardTitle =
    step === "done"
      ? "Password updated"
      : step === "phone"
        ? "Forgot Password"
        : step === "otp"
          ? "Enter verification code"
          : "Set new password";

  const phoneTail = phone.replace(/\D/g, "").slice(-4);
  const phoneHint =
    phoneTail.length >= 2
      ? `Code sent to your number ending in ····${phoneTail}`
      : null;

  return (
    <PublicLayout>
      <div className="container px-4 py-16 max-w-md mx-auto">
        <Card
          className={`border-2 transition-shadow ${step === "otp" ? "ring-2 ring-primary/30 shadow-md" : ""}`}
        >
          <CardHeader className="text-center">
            <CardTitle
              className="text-2xl font-bold text-primary"
              data-testid="text-forgot-password-title"
            >
              {cardTitle}
            </CardTitle>
            <p className="text-muted-foreground mt-2">{stepSubtitle}</p>
            {step === "otp" && phoneHint ? (
              <p
                className="text-sm font-medium text-foreground mt-3"
                data-testid="text-otp-sent-hint"
              >
                {phoneHint}
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            {step === "done" ? (
              <div
                className="text-center space-y-4"
                data-testid="text-reset-success"
              >
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">
                  Password Reset Successful
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been updated. You can sign in with your new
                  password. If SMS is enabled, you may get a short confirmation
                  text on your phone.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => setLocation("/member/login")}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="button-go-to-login"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : step === "phone" ? (
              <>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      ስልክ ቁጥር / Phone Number
                    </label>
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
                    {isLoading ? "Sending..." : "Send OTP Code"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link
                    href="/member/login"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </div>
              </>
            ) : step === "otp" ? (
              <>
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                  data-testid="form-enter-otp"
                >
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <label
                      className="text-sm font-medium block"
                      htmlFor="forgot-password-otp"
                    >
                      SMS verification code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={otpInputRef}
                        id="forgot-password-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-10 text-center text-lg tracking-[0.35em] font-mono h-12"
                        maxLength={6}
                        data-testid="input-otp"
                        aria-describedby="forgot-otp-hint"
                      />
                    </div>
                    <p
                      id="forgot-otp-hint"
                      className="text-xs text-muted-foreground"
                    >
                      Code expires in 5 minutes
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid="button-verify-otp"
                  >
                    {isLoading ? "Checking..." : "Verify code"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    data-testid="button-resend-otp"
                  >
                    Resend SMS code
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <Link
                    href="/member/login"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <form
                  key={passwordFormKey}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                  data-testid="form-new-password"
                >
                  <p className="text-sm text-muted-foreground">
                    Enter your new password twice. Fields are cleared after you
                    verify the SMS code.
                  </p>
                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"
                      htmlFor="forgot-new-password"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={newPasswordRef}
                        id="forgot-new-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        minLength={6}
                        data-testid="input-new-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"
                      htmlFor="forgot-confirm-password"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        minLength={6}
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid="button-reset-password"
                  >
                    {isLoading ? "Saving..." : "Save new password"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    disabled={isLoading}
                    onClick={() => {
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordFormKey((k) => k + 1);
                      setStep("otp");
                    }}
                  >
                    Back to code entry
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <Link
                    href="/member/login"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
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
