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
        "relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl border-2 rounded-2xl",
        tier.recommended
          ? "border-primary/70 shadow-xl scale-[1.02] z-10"
          : "border-border hover:border-primary/40",
      )}
    >
      {tier.recommended && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          Most Popular
        </div>
      )}

      <CardHeader className={cn("pb-8 pt-8 text-center", tier.color)}>
        <CardTitle className="font-heading text-3xl font-bold uppercase tracking-wide">
          {tier.name}
        </CardTitle>
        {tier.amharicVersion && (
          <p className="text-base font-semibold opacity-95 mt-1">
            {tier.amharicVersion}
          </p>
        )}
        <CardDescription
          className={cn(
            "text-lg font-medium opacity-90",
            tier.recommended ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {billingCycle === "monthly"
            ? "Monthly Membership"
            : "Annual Membership"}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold font-display">{price}</span>
          <span className="text-sm opacity-80 font-normal">
            {billingCycle === "monthly" ? "/month" : "/year"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-8">
        <ul className="space-y-4">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pb-8 pt-4">
        <Button
          onClick={handleSelect}
          className={cn(
            "w-full uppercase font-display tracking-widest text-sm h-auto min-h-12 py-3 whitespace-normal break-words rounded-xl",
            tier.recommended
              ? "bg-primary hover:bg-primary/90"
              : "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
          )}
          data-testid={`button-select-${tier.id}`}
        >
          Select {tier.name}
        </Button>
      </CardFooter>
    </Card>
  );
}
