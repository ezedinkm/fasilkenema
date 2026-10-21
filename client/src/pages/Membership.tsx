import PublicLayout from "@/components/PublicLayout";
import MembershipCard from "@/components/MembershipCard";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getMembershipTiers } from "@/lib/membershipTiers";

interface MembershipTier {
  id: string;
  name: string;
  amharicVersion?: string;
  price: { etb: number; usd: number };
  monthlyPrice?: { etb: number; usd: number };
  benefits: string[];
  color: string;
  recommended: boolean;
}

export default function Membership() {
  const [currency, setCurrency] = useState<"etb" | "usd">("etb");
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(
    "annual",
  );
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const apiTiers = await getMembershipTiers();
        setTiers(apiTiers);
      } catch (error) {
        console.error("Failed to fetch membership tiers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTiers();
  }, []);

  const sortedTiers = useMemo(() => {
    return [...tiers].sort((a, b) => {
      const aPrice =
        billingCycle === "monthly"
          ? currency === "etb"
            ? (a.monthlyPrice?.etb ?? a.price.etb)
            : (a.monthlyPrice?.usd ?? a.price.usd)
          : currency === "etb"
            ? a.price.etb
            : a.price.usd;
      const bPrice =
        billingCycle === "monthly"
          ? currency === "etb"
            ? (b.monthlyPrice?.etb ?? b.price.etb)
            : (b.monthlyPrice?.usd ?? b.price.usd)
          : currency === "etb"
            ? b.price.etb
            : b.price.usd;

      return bPrice - aPrice;
    });
  }, [tiers, currency, billingCycle]);

  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container px-4 relative z-10 text-center">
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
            Join The Family
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Support Mechal FC directly and enjoy exclusive benefits. Choose your
            tier, grow with the club, and power success on and off the pitch.
          </p>
        </div>
      </div>

      <div className="bg-zinc-50">
        <div className="container px-4 py-14 md:py-16">
          {/* Currency Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-12 bg-white border border-zinc-200 rounded-xl px-6 py-4 max-w-md mx-auto shadow-sm">
            <Label
              htmlFor="currency-mode"
              className={`text-lg font-bold ${currency === "etb" ? "text-primary" : "text-muted-foreground"}`}
            >
              ETB
            </Label>
            <Switch
              id="currency-mode"
              checked={currency === "usd"}
              onCheckedChange={(checked) =>
                setCurrency(checked ? "usd" : "etb")
              }
            />
            <Label
              htmlFor="currency-mode"
              className={`text-lg font-bold ${currency === "usd" ? "text-primary" : "text-muted-foreground"}`}
            >
              USD
            </Label>
          </div>
          <div className="flex justify-center items-center space-x-4 mb-12 bg-white border border-zinc-200 rounded-xl px-6 py-4 max-w-md mx-auto shadow-sm">
            <Label
              htmlFor="billing-mode"
              className={`text-lg font-bold ${billingCycle === "annual" ? "text-primary" : "text-muted-foreground"}`}
            >
              Annual
            </Label>
            <Switch
              id="billing-mode"
              checked={billingCycle === "monthly"}
              onCheckedChange={(checked) =>
                setBillingCycle(checked ? "monthly" : "annual")
              }
            />
            <Label
              htmlFor="billing-mode"
              className={`text-lg font-bold ${billingCycle === "monthly" ? "text-primary" : "text-muted-foreground"}`}
            >
              Monthly
            </Label>
          </div>

          {loading ? (
            <div className="text-center py-12">
              Loading membership options...
            </div>
          ) : (
            <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8">
              {sortedTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="w-full max-w-[420px] md:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.333rem)]"
                >
                  <MembershipCard
                    tier={tier}
                    currency={currency}
                    billingCycle={billingCycle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
