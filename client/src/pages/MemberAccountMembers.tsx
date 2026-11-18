import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getMembershipTiers, type MembershipTier } from "@/lib/membershipTiers";
import { isAllowedJpgPngAttachment } from "@shared/attachmentImagePolicy";
import { ArrowLeft, UserRound, Users } from "lucide-react";

interface ManagedMember {
  id: number;
  membershipNumber: string;
  fullName: string;
  gender: string | null;
  tier: string;
  status: string;
  expiryDate: string | null;
  isAccountOwner: boolean;
}

export default function MemberAccountMembers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [members, setMembers] = useState<ManagedMember[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [city, setCity] = useState("Gondar");
  const [country, setCountry] = useState("Ethiopia");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [tierId, setTierId] = useState("");
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [photo, setPhoto] = useState<File | null>(null);

  const token = () => localStorage.getItem("memberToken");

  const loadPageData = async () => {
    const authToken = token();
    if (!authToken) {
      setLocation("/member/login");
      return;
    }
    try {
      const [memberResponse, tierRows] = await Promise.all([
        fetch("/api/member/managed-members", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        getMembershipTiers(),
      ]);
      const result = await memberResponse.json().catch(() => ({}));
      if (!memberResponse.ok) {
        throw new Error(result.error || "Could not load memberships.");
      }
      setMembers(result.members || []);
      setTiers(tierRows);
      setTierId((current) => current || tierRows[0]?.id || "");
      const paymentStatus = new URLSearchParams(window.location.search).get("payment");
      if (paymentStatus) {
        toast(
          paymentStatus === "success"
            ? { title: "Membership payment confirmed", description: "The new member and card are now in this account." }
            : paymentStatus === "pending"
              ? { title: "Payment is being confirmed", description: "Refresh this page in a moment to see the new membership." }
              : { title: "Payment was not confirmed", description: "You can try the checkout again.", variant: "destructive" },
        );
        window.history.replaceState({}, "", "/member/members");
      }
    } catch (error) {
      toast({
        title: "Could not load memberships",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
    // Load once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMembership = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dateOfBirth ||
      !city.trim() ||
      !country.trim() ||
      !tierId
    ) {
      toast({
        title: "Complete the required fields",
        description: "Name, date of birth, city, country, and membership tier are required.",
        variant: "destructive",
      });
      return;
    }
    if (photo && (!isAllowedJpgPngAttachment(photo) || photo.size > 5 * 1024 * 1024)) {
      toast({
        title: "Photo cannot be used",
        description: "Choose a JPG, JPEG, or PNG image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    const authToken = token();
    if (!authToken) {
      setLocation("/member/login");
      return;
    }
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || "Could not upload the photo.");
        }
        photoUrl = uploadResult.photoUrl || null;
      }

      const response = await fetch("/api/members/initialize-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currency,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
          city: city.trim(),
          country: country.trim(),
          membershipTier: tierId,
          gender: gender || null,
          address: address.trim() || null,
          memberPhone: memberPhone.trim() || null,
          memberEmail: memberEmail.trim().toLowerCase() || null,
          photoUrl,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Could not start the membership payment.");
      }
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      toast({
        title: "Could not start membership",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Button variant="ghost" onClick={() => setLocation("/member/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Member dashboard
        </Button>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-700">Membership account</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">Manage memberships</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Your own membership is shown here when you have one. Add as many other people as needed; each gets a separate membership ID and card, with an individual annual payment.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5 text-red-700" /> People in this account
          </h2>
          {loading ? (
            <p className="text-muted-foreground">Loading memberships…</p>
          ) : members.length === 0 ? (
            <p className="rounded-lg border bg-white p-5 text-muted-foreground">No memberships found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{member.fullName}</p>
                        {member.isAccountOwner && (
                          <p className="text-xs text-muted-foreground">Account owner</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {member.membershipNumber}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Tier: {member.tier}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Expires: {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : "—"}
                    </p>
                    <Button
                      className="mt-5 w-full bg-red-700 hover:bg-red-800"
                      onClick={() => setLocation(`/member/dashboard?memberId=${member.id}`)}
                    >
                      View membership card
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Card className="border-t-4 border-t-red-700 shadow-sm">
          <CardHeader>
            <CardTitle>Add another person</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter this person’s details, choose an annual tier, and complete their separate payment.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input aria-label="First name" placeholder="First name *" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            <Input aria-label="Last name" placeholder="Last name *" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            <Input aria-label="City" placeholder="City *" value={city} onChange={(event) => setCity(event.target.value)} />
            <Input aria-label="Country" placeholder="Country *" value={country} onChange={(event) => setCountry(event.target.value)} />
            <label className="text-sm text-muted-foreground">
              Date of birth *
              <Input className="mt-1 text-foreground" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground">
              Membership tier *
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={tierId}
                onChange={(event) => setTierId(event.target.value)}
              >
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} — {currency === "ETB"
                      ? `${Number(tier.price.etb).toLocaleString()} ETB/year`
                      : `$${Number(tier.price.usd).toLocaleString()} USD/year`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">
              Payment currency
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as "ETB" | "USD")}
              >
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </label>
            {tiers.find((tier) => tier.id === tierId) && (
              <p className="self-end rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                Separate annual payment: {currency === "ETB"
                  ? `${Number(tiers.find((tier) => tier.id === tierId)?.price.etb || 0).toLocaleString()} ETB`
                  : `$${Number(tiers.find((tier) => tier.id === tierId)?.price.usd || 0).toLocaleString()} USD`}
              </p>
            )}
            <label className="text-sm text-muted-foreground">
              Sex
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value="">Not specified</option>
                <option value="ወንድ">ወንድ</option>
                <option value="ሴት">ሴት</option>
              </select>
            </label>
            <Input aria-label="Address" placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
            <Input
              aria-label="Member phone"
              type="tel"
              placeholder="Member phone (optional)"
              value={memberPhone}
              onChange={(event) => setMemberPhone(event.target.value)}
            />
            <Input
              aria-label="Member email"
              type="email"
              placeholder="Member email (optional)"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
            />
            <label className="text-sm text-muted-foreground sm:col-span-2">
              Photo for membership card
              <Input
                className="mt-1 text-foreground"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(event) => setPhoto(event.target.files?.[0] || null)}
              />
              <span className="mt-1 block text-xs">JPG, JPEG, or PNG only; maximum 5MB.</span>
            </label>
            <Button
              className="sm:col-span-2 bg-red-700 hover:bg-red-800"
              disabled={submitting || tiers.length === 0}
              onClick={() => void startMembership()}
            >
              {submitting ? "Starting secure payment…" : "Continue to separate payment"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </PublicLayout>
  );
}
