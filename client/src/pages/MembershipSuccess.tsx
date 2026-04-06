import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

type PaymentOutcome = "success" | "failed" | "pending" | null;

function parsePaymentOutcome(search: string): PaymentOutcome {
  const q = new URLSearchParams(search).get("payment");
  if (q === "success" || q === "failed" || q === "pending") return q;
  return null;
}

export default function MembershipSuccess() {
  const [, setLocation] = useLocation();
  const [paymentOutcome, setPaymentOutcome] = useState<PaymentOutcome>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const outcome = parsePaymentOutcome(window.location.search);
    setPaymentOutcome(outcome);
    setReady(true);
    if (outcome) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!ready) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground">Loading…</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (paymentOutcome === "success") {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-20 h-20 text-primary" />
              </div>
              <CardTitle className="text-center font-display text-3xl">
                Welcome to The Family of FASIL S.C.!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-xl">
                Your membership registration was successful. You are now an
                official member of the FASIL S.C. Fan Club!
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-2">
                <p className="font-semibold">What's Next?</p>
                <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                  <li>
                    ✓ Login with your phone number to view your digital
                    membership card
                  </li>
                  <li>
                    ✓ You'll receive exclusive updates and benefits via SMS
                  </li>
                  <li>✓ Download your membership card from your dashboard</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  data-testid="button-home"
                >
                  Go to Home
                </Button>
                <Button
                  onClick={() => setLocation("/contact")}
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

  if (paymentOutcome === "pending") {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="text-center text-amber-800">
                Payment processing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>
                Your payment is still being confirmed. Please wait a few
                minutes, then log in with your phone number.
              </p>
              <Button
                onClick={() => setLocation("/member/login")}
                data-testid="button-member-login"
              >
                Member login
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
        <Card className="border-t-4 border-t-destructive">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Payment Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              We could not confirm your membership payment. Please try again or
              contact support.
            </p>
            <Button
              onClick={() => setLocation("/membership")}
              data-testid="button-back-membership"
            >
              Back to Membership Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
