import PublicLayout from "@/components/PublicLayout";
import cardBackground from "@/assets/card-bg.jpg";
import QRCode from "react-qr-code";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileImage, FileText, User } from "lucide-react";
import { getMembershipTiers, type MembershipTier } from "@/lib/membershipTiers";

interface MemberData {
  membershipNumber: string;
  fullName: string;
  rank: string | null;
  gender: string | null;
  address: string | null;
  division: string | null;
  phone: string;
  tier: string;
  photoUrl: string | null;
  joinedDate: string;
  expiryDate: string;
  status: string;
}

export default function DigitalCard() {
  const [match, params] = useRoute("/card/:membershipNumber");
  const cardRef = useRef<HTMLDivElement>(null);

  const membershipNumber = params?.membershipNumber;

  const {
    data: member,
    isLoading,
    error,
  } = useQuery<MemberData>({
    queryKey: ["/api/public/member", membershipNumber],
    queryFn: async () => {
      const res = await fetch(`/api/public/member/${membershipNumber}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Member not found");
      }
      return res.json();
    },
    enabled: !!membershipNumber,
  });

  const { data: membershipTierRows = [] } = useQuery<MembershipTier[]>({
    queryKey: ["/api/membership-tiers"],
    queryFn: getMembershipTiers,
    staleTime: 5 * 60 * 1000,
  });

  const { data: branding = [] } = useQuery<any[]>({
    queryKey: ["/api/public/branding"],
    staleTime: Infinity,
  });
  const brandingSettings = {
    signature:
      branding.find((setting) => setting.key === "branding.signature")?.value ||
      null,
    authorizedPersonName:
      branding.find(
        (setting) => setting.key === "branding.authorizedPersonName",
      )?.value || null,
    stamp:
      branding.find((setting) => setting.key === "branding.stamp")?.value ||
      null,
  };

  const memberTier = useMemo(() => {
    if (!member) return undefined;
    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/-level$/g, "")
        .replace(/level$/g, "")
        .replace(/-/g, "");
    const memberTierId = normalize(member.tier);
    return membershipTierRows.find(
      (tier) =>
        normalize(tier.id) === memberTierId ||
        normalize(tier.name) === memberTierId ||
        normalize(tier.amharicVersion) === memberTierId,
    );
  }, [member, membershipTierRows]);
  const cardBackgroundUrl =
    memberTier?.frontBackgroundUrl || cardBackground;

  const handleDownloadPNG = async () => {
    if (!cardRef.current || !member) return;
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = "540px";
    el.style.minWidth = "540px";
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const link = document.createElement("a");
      link.download = `membership-card-${member.membershipNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !member) return;
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = "540px";
    el.style.minWidth = "540px";
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`membership-card-${member.membershipNumber}.pdf`);
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-zinc-100 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading membership card...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !member) {
    return (
      <PublicLayout>
        <div className="bg-zinc-100 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="text-center max-w-md">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Member Not Found</h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "This membership card is not available or has expired."}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-zinc-100 flex items-center justify-center p-4 py-8">
        <div className="max-w-3xl w-full overflow-x-auto">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary font-heading uppercase tracking-wider">
            የ አባልነት መታወቂያ ካርድ
          </h1>

          <div
            ref={cardRef}
            className="relative rounded-xl overflow-hidden shadow-2xl"
            style={{ width: "540px", height: "340px" }}
          >
            <img
              src={cardBackgroundUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />

            <div
              className="relative h-full flex flex-col"
              style={{ zIndex: 2 }}
            >
              <div
                className="px-4 py-1.5 text-center"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              >
                <p className="font-heading text-sm font-bold tracking-wide text-white drop-shadow-md">
                  መቻል ስፖርት ክለብ የደጋፊዎች ማህበር
                </p>
              </div>

              <div className="flex-1 flex gap-2 sm:gap-3 px-3 pt-2 pb-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-white/60 shadow-lg">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/20">
                        <User className="w-8 h-8 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-md text-center shadow-md"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <p className="text-[7px] uppercase tracking-wider text-yellow-300">
                      የአባልነት ቁጥር / ID
                    </p>
                    <p className="font-mono font-bold text-[10px] text-white">
                      {member.membershipNumber}
                    </p>
                  </div>
                  <div className="rounded bg-white p-1 shadow-md">
                    <QRCode
                      value={`${window.location.origin}/card/${encodeURIComponent(member.membershipNumber)}`}
                      size={48}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-bold text-sm leading-tight text-white drop-shadow-md mb-0.5">
                    {member.fullName}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-[10px]">★</span>
                    <p className="text-[10px] text-white drop-shadow-sm">
                      <span className="text-white/70">ጾታ / Sex:</span>{" "}
                      <span className="font-semibold">
                        {member.gender || "—"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-[10px]">★</span>
                    <p className="text-[10px] text-white drop-shadow-sm">
                      <span className="text-white/70">አድራሻ / Address:</span>{" "}
                      <span className="font-semibold">
                        {member.address || "—"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-[10px]">★</span>
                    <p className="text-[10px] text-white drop-shadow-sm">
                      <span className="text-white/70">ስልክ / Phone:</span>{" "}
                      <span className="font-semibold">{member.phone}</span>
                    </p>
                  </div>
                </div>

                {(brandingSettings.stamp ||
                  brandingSettings.signature ||
                  brandingSettings.authorizedPersonName) && (
                  <div className="w-[68px] sm:w-[96px] flex-shrink-0 flex flex-col items-center gap-1.5 pt-1">
                    {brandingSettings.stamp && (
                      <img
                        src={brandingSettings.stamp}
                        alt="Official membership stamp"
                        className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                      />
                    )}
                    {brandingSettings.signature && (
                      <img
                        src={brandingSettings.signature}
                        alt="Authorized signature"
                        className="w-full h-5 sm:h-7 object-contain"
                      />
                    )}
                    {brandingSettings.authorizedPersonName && (
                      <p className="text-[7px] sm:text-[9px] leading-tight text-center font-semibold text-white drop-shadow-md break-words">
                        {brandingSettings.authorizedPersonName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              ይህን QR ኮድ በስታዲየም ለቅድሚያ ተደራሽነት ያሳዩ
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadPNG}
                data-testid="button-download-png"
              >
                <FileImage className="mr-2 h-4 w-4" /> Download PNG
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadPDF}
                data-testid="button-download-pdf"
              >
                <FileText className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
