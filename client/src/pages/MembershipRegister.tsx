import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getMembershipTiers } from "@/lib/membershipTiers";
import {
  isValidEthiopianMobile,
  normalizeEthiopianMobileLocal,
} from "@shared/ethiopianPhone";
import { Camera, Upload } from "lucide-react";
import { isAllowedJpgPngAttachment } from "@shared/attachmentImagePolicy";

interface MembershipTier {
  id: string;
  name: string;
  price: { etb: number; usd: number };
  benefits: string[];
  color: string;
  recommended: boolean;
}

export default function MembershipRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [currency, setCurrency] = useState<"etb" | "usd">("etb");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [rank, setRank] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [city, setCity] = useState("gonder");
  const [country, setCountry] = useState("ethiopia");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isAllowedJpgPngAttachment(file)) {
        toast({
          title: "Unsupported image format",
          description: "Upload a JPG, JPEG, or PNG file.",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function fetchTiersAndSelect() {
      const params = new URLSearchParams(window.location.search);
      const tierId = params.get("tier");
      const currencyParam = params.get("currency") as "etb" | "usd";

      if (!tierId) {
        setLocation("/membership");
        return;
      }

      try {
        const tiers = await getMembershipTiers();
        const tier = tiers.find((t) => t.id === tierId);

        if (!tier) {
          setLocation("/membership");
          return;
        }

        setSelectedTier(tier);
        if (currencyParam === "etb" || currencyParam === "usd") {
          setCurrency(currencyParam);
        }
      } catch (error) {
        console.error("Failed to fetch membership tiers:", error);
        setLocation("/membership");
      } finally {
        setLoading(false);
      }
    }

    fetchTiersAndSelect();
  }, [setLocation]);

  const handleSubmit = async () => {
    const identifier = contactMethod === "phone" ? phone.trim() : email.trim();
    if (
      !firstName ||
      !lastName ||
      !identifier ||
      !dateOfBirth ||
      !city ||
      !country ||
      !password
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (contactMethod === "phone" && !isValidEthiopianMobile(phone)) {
      toast({
        title: "Invalid phone number",
        description:
          "Use an Ethiopian mobile number: 09xxxxxxxx or 07xxxxxxxx (or +251 9x / 7x with country code).",
        variant: "destructive",
      });
      return;
    }

    if (
      contactMethod === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      toast({
        title: "Invalid email address",
        description: "Enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTier) {
      toast({
        title: "Error",
        description: "No membership tier selected",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!verificationSent) {
        const response = await fetch("/api/member/registration/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: contactMethod, identifier }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || "Could not send the verification code.");
        }
        setVerificationSent(true);
        setVerificationCode("");
        toast({
          title: "Verification code sent",
          description: `Check your ${contactMethod} for the six-digit code.`,
        });
        return;
      }

      if (!contactVerified) {
        if (!/^\d{6}$/.test(verificationCode.trim())) {
          toast({
            title: "Enter the verification code",
            description: "The code must contain six digits.",
            variant: "destructive",
          });
          return;
        }
        const response = await fetch("/api/member/registration/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: contactMethod,
            identifier,
            code: verificationCode.trim(),
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || "Could not verify your contact.");
        }
        setContactVerified(true);
        toast({
          title: "Contact verified",
          description: "Continue to payment to finish membership signup.",
        });
        return;
      }

      let photoUrl = null;

      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          photoUrl = uploadResult.photoUrl;
        } else {
          toast({
            title: "Photo Upload Failed",
            description: "Could not upload photo. Continuing without photo.",
            variant: "destructive",
          });
        }
      }

      const paymentData = {
        currency: currency.toUpperCase(),
        firstName,
        lastName,
        method: contactMethod,
        phone:
          contactMethod === "phone"
            ? normalizeEthiopianMobileLocal(phone)!
            : null,
        email: contactMethod === "email" ? email.trim().toLowerCase() : null,
        password,
        // rank,
        gender,
        address,
        // division,
        dateOfBirth,
        city,
        country,
        membershipTier: selectedTier.id,
        photoUrl,
      };

      const response = await fetch("/api/members/initialize-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json().catch(() => ({}));

      if (result.error) {
        if (result.error.includes("Verify your phone or email")) {
          setVerificationSent(false);
          setContactVerified(false);
        }
        toast({
          title: response.status === 409 ? "Already a member" : "Error",
          description: result.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
      } else if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process registration. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  if (!selectedTier) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-primary mb-4">
            Invalid Membership Tier
          </h1>
          <p className="text-muted-foreground mb-6">
            Please go back and select a valid membership option.
          </p>
          <Button
            onClick={() => setLocation("/membership")}
            className="h-12 px-6 text-lg font-bold bg-primary hover:bg-primary/90"
          >
            Back to Membership
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const price =
    currency === "etb"
      ? `${selectedTier.price.etb} ETB`
      : `$${selectedTier.price.usd} USD`;

  return (
    <PublicLayout>
      <div className="bg-zinc-50">
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-primary mb-4">
              Join The Family
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete your {selectedTier.name} membership registration
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">
                {selectedTier.name} Membership - {price}/year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                    <Input
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Sign up using
                    </label>
                    <select
                      value={contactMethod}
                      onChange={(e) => {
                        setContactMethod(e.target.value as "phone" | "email");
                        setVerificationSent(false);
                        setContactVerified(false);
                        setVerificationCode("");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid="select-contact-method"
                    >
                      <option value="phone">Phone number</option>
                      <option value="email">Email address</option>
                    </select>
                    {contactMethod === "phone" ? (
                      <>
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="09xxxxxxxx or +251 9x xxx xxxx *"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setVerificationSent(false);
                            setContactVerified(false);
                          }}
                          onBlur={() => {
                            const n = normalizeEthiopianMobileLocal(phone);
                            if (n) setPhone(n);
                          }}
                          data-testid="input-phone"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          This number will be verified and used to sign in.
                        </p>
                      </>
                    ) : (
                      <>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="Email address *"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setVerificationSent(false);
                            setContactVerified(false);
                          }}
                          data-testid="input-email"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          This email will be verified and used to sign in.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        ዖታ / Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-testid="input-gender"
                      >
                        <option value="">ዖታ ይምረጡ</option>
                        <option value="ወንድ">ወንድ</option>
                        <option value="ሴት">ሴት</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        አድራሻ / Address
                      </label>
                      <Input
                        placeholder="አድራሻ / Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        data-testid="input-address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Profile Photo (for membership card)
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="photo-upload-area"
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                           accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={handlePhotoChange}
                          className="hidden"
                          data-testid="input-photo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="mb-2"
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {photoFile ? "Change Photo" : "Upload Photo"}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, JPEG, or PNG only. Max 5MB. This photo will
                          appear on your digital membership card.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Location</h3>
                <div className="space-y-4">
                  <Input 
                    placeholder="City *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-testid="input-city"
                  />
                  <Input 
                    placeholder="Country *"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    data-testid="input-country"
                  />
                </div>
              </div> */}

              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Create Account Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a password to access your digital membership card after
                  registration.
                </p>
                <div className="space-y-4">
                  {verificationSent && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Enter the six-digit code sent to your {contactMethod}.
                      </p>
                      <Input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="Verification code"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, ""))
                        }
                        data-testid="input-registration-code"
                      />
                      {contactVerified && (
                        <p className="text-sm font-medium text-green-700">
                          Contact verified.
                        </p>
                      )}
                    </div>
                  )}
                  <Input
                    placeholder="Password *"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <Input
                    placeholder="Confirm Password *"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters. You will sign in
                    with your selected {contactMethod}.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
                  data-testid="button-proceed-payment"
                >
                  {isSubmitting
                    ? "Processing..."
                    : !verificationSent
                      ? "Send Verification Code"
                      : !contactVerified
                        ? "Verify Contact"
                        : `Proceed to Payment - ${price}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  You will be redirected to secure Chapa payment gateway
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
