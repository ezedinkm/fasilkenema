import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import membershipCardPattern from "@/assets/membership-card-pattern.webp";

interface MembershipCardProps {
  tier: {
    id: string;
    name: string;
    amharicVersion?: string;
    price: { etb: number; usd: number };
    monthlyPrice?: { etb: number; usd: number };
    benefits: string[];
    color: string;
    recommended: boolean;
  };
  currency: "etb" | "usd";
  billingCycle?: "annual" | "monthly";
}

export default function MembershipCard({
  tier,
  currency,
  billingCycle = "annual",
}: MembershipCardProps) {
  const [, setLocation] = useLocation();
  const selectedPrice =
    billingCycle === "monthly" ? (tier.monthlyPrice ?? tier.price) : tier.price;
  const price =
    currency === "etb" ? `${selectedPrice.etb} ETB` : `$${selectedPrice.usd}`;

  const handleSelect = () => {
    setLocation(
      `/membership/register?tier=${tier.id}&currency=${currency}&billing=${billingCycle}`,
    );
  };

  return (
    <Card
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#e8d96b] bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        tier.recommended
          ? "ring-2 ring-[#e8d96b]/40"
          : "hover:border-[#d7c54d]",
      )}
      style={{
        backgroundImage: `url(${membershipCardPattern})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-white/35"
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full flex-col">
        {tier.recommended && (
          <div className="absolute right-0 top-0 rounded-bl-xl bg-[#6f3218] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            Most Popular
          </div>
        )}

        <CardHeader className="flex min-h-[235px] flex-col items-center justify-center border-b border-white/60 bg-zinc-100/75 px-5 pb-8 pt-10 text-center backdrop-blur-[2px]">
          <CardTitle className="font-heading text-3xl font-bold uppercase tracking-wide text-zinc-950">
            {tier.name}
          </CardTitle>
          {tier.amharicVersion && (
            <p className="mt-2 text-base font-semibold text-zinc-800">
              {tier.amharicVersion}
            </p>
          )}
          <CardDescription className="mt-2 text-lg font-medium text-zinc-500">
            {billingCycle === "monthly"
              ? "Monthly Membership"
              : "Annual Membership"}
          </CardDescription>
          <div className="mt-5">
            <span className="font-display text-5xl font-bold text-zinc-950">
              {price}
            </span>
            <span className="text-base font-normal text-zinc-600">
              {billingCycle === "monthly" ? "/month" : "/year"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-grow bg-white/85 px-6 py-8 backdrop-blur-[2px]">
          <ul className="space-y-5">
            {tier.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <Check className="h-3.5 w-3.5 text-[#d0bd37]" />
                </div>
                <span className="text-base leading-relaxed text-zinc-800">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="bg-white/85 px-6 pb-8 pt-4 backdrop-blur-[2px]">
          <Button
            onClick={handleSelect}
            className="min-h-14 w-full whitespace-normal break-words rounded-xl border-2 border-[#d6bf28] bg-[#6f3218] py-3 font-display text-sm uppercase tracking-widest text-white hover:bg-[#572410]"
            data-testid={`button-select-${tier.id}`}
          >
            Select {tier.name}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
