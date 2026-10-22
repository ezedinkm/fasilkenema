import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { LogOut, User, FileImage, FileText, RefreshCw } from "lucide-react";
import { getSettingByKey } from "@/lib/api";
import {
  getMembershipTiers,
  type MembershipTier,
} from "@/lib/membershipTiers";
import { MEMBERSHIP_TIERS } from "@/lib/mockData";
import { getLocalAssetUrl } from "@/lib/localAssets";

/** Asset order: 120 → 600 → 2000 → … → 36000; aligned 1:1 with `ID_CARD_TIER_ORDER` (low → high). */
const idCardImg120 = getLocalAssetUrl("ID/120corrected.jpg");
const idCardImg600 = getLocalAssetUrl("ID/600corrected.jpg");
const idCardImg2000 = getLocalAssetUrl("ID/2000corrected.jpg");
const idCardImg3000 = getLocalAssetUrl("ID/3000corrected.jpg");
const idCardImg4000 = getLocalAssetUrl("ID/4000corrected.jpg");
const idCardImg6000 = getLocalAssetUrl("ID/6000corrected.jpg");
const idCardImg8000 = getLocalAssetUrl("ID/8000correected.jpg");
const idCardImg12000 = getLocalAssetUrl("ID/12000corrected.jpg");
const idCardImg15000 = getLocalAssetUrl("ID/15000corrected.jpg");
const idCardImg36000 = getLocalAssetUrl("ID/36000corrected.jpg");

/** Canonical membership tiers (same order as image files above). */
const ID_CARD_TIER_ORDER = [
  { id: "youth-level", priceEtb: 120 },
  { id: "bronze-level", priceEtb: 300 },
  { id: "silver-level", priceEtb: 600 },
  { id: "gold-level", priceEtb: 1200 },
  { id: "ras-level", priceEtb: 2000 },
  { id: "zebel-level", priceEtb: 4000 },
  { id: "emerald-level", priceEtb: 6000 },
  { id: "diamond-level", priceEtb: 8000 },
  { id: "platinum-level", priceEtb: 12000 },
  { id: "tewodros-level", priceEtb: 36000 },
] as const;

const ID_CARD_TEMPLATES_ORDERED = [
  idCardImg120,
  idCardImg600,
  idCardImg2000,
  idCardImg3000,
  idCardImg4000,
  idCardImg6000,
  idCardImg8000,
  idCardImg12000,
  idCardImg15000,
  idCardImg36000,
] as const;

const ID_CARD_TEMPLATE_DEFAULT = ID_CARD_TEMPLATES_ORDERED[ID_CARD_TEMPLATES_ORDERED.length - 1];

/** Tier id → card art (order matches `ID_CARD_TIER_ORDER` ↔ `ID_CARD_TEMPLATES_ORDERED`). */
const ID_CARD_TEMPLATE_BY_TIER_ID: Record<string, string | undefined> = Object.fromEntries(
  ID_CARD_TIER_ORDER.map((entry, index) => [entry.id.toLowerCase(), ID_CARD_TEMPLATES_ORDERED[index]]),
);

interface MemberData {
  id: number;
  membershipNumber: string;
  fullName: string;
  phone: string;
  rank: string | null;
  gender: string | null;
  address: string | null;
  division: string | null;
  tier: string;
  photoUrl: string | null;
  expiryDate: string;
  status: string;
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [member, setMember] = useState<MemberData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: membershipTierRows = [] } = useQuery<MembershipTier[]>({
    queryKey: ["/api/membership-tiers"],
    queryFn: getMembershipTiers,
    staleTime: 5 * 60 * 1000,
  });
  const availableTiers = useMemo(
    () =>
      membershipTierRows.map((tier) => ({
        id: tier.id,
        name: tier.name || tier.id,
        priceEtbAnnual: Number(tier.price.etb) || 0,
        priceUsdAnnual: Number(tier.price.usd) || 0,
      })),
    [membershipTierRows],
  );
  const [renewTier, setRenewTier] = useState("");
  const [renewCurrency, setRenewCurrency] = useState<"ETB" | "USD">("ETB");
  const [renewPhone, setRenewPhone] = useState("");
  const [isRenewPhoneEdited, setIsRenewPhoneEdited] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  const refreshMemberData = useCallback(async (token: string) => {
    const meRes = await fetch("/api/member/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      throw new Error("Failed to refresh member data");
    }
    const me = await meRes.json();
    setMember(me);
    localStorage.setItem("memberData", JSON.stringify(me));
    return me;
  }, []);

  const { data: membershipTiersSetting } = useQuery<any>({
    queryKey: ["/api/settings/membership_tiers"],
    staleTime: Infinity,
    queryFn: () => getSettingByKey("membership_tiers"),
  });

  const waitForImages = async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      images.map(async (imgNode) => {
        const img = imgNode as HTMLImageElement;
        try {
          if (img.complete && img.naturalWidth > 0) {
            return;
          }
          if (typeof img.decode === "function") {
            await img.decode().catch(() => undefined);
            if (img.complete && img.naturalWidth > 0) {
              return;
            }
          }
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        } catch {
          // Best-effort image readiness.
        }
      }),
    );
  };

  const normalizeCaptureStyles = (root: HTMLElement) => {
    root.style.transform = "none";
    root.style.backfaceVisibility = "visible";
    root.style.filter = "none";
    root.querySelectorAll<HTMLElement>("*").forEach((node) => {
      node.style.backfaceVisibility = "visible";
      node.style.filter = "none";
      node.style.transformStyle = "flat";
      node.style.animation = "none";
      node.style.transition = "none";
    });
  };

  const inlineResolvedStyles = (sourceRoot: HTMLElement, cloneRoot: HTMLElement) => {
    const sourceNodes = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll<HTMLElement>("*"))];
    const cloneNodes = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll<HTMLElement>("*"))];
    const count = Math.min(sourceNodes.length, cloneNodes.length);

    for (let i = 0; i < count; i += 1) {
      const source = sourceNodes[i];
      const clone = cloneNodes[i];
      const computed = window.getComputedStyle(source);
      const declarations: string[] = [];

      for (let j = 0; j < computed.length; j += 1) {
        const prop = computed[j];
        const value = computed.getPropertyValue(prop);
        if (!value) continue;
        // html2canvas parser fails on unsupported color function values.
        if (value.includes("oklch(")) continue;
        declarations.push(`${prop}:${value};`);
      }

      clone.setAttribute("style", declarations.join(""));
      clone.removeAttribute("class");
    }
  };

  const captureCardCanvas = async (element: HTMLDivElement) => {
    // Clone into a detached wrapper to avoid 3D flip/backface issues.
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.width = "540px";
    wrapper.style.height = "340px";
    wrapper.style.zIndex = "-1";
    wrapper.style.pointerEvents = "none";

    const clone = element.cloneNode(true) as HTMLDivElement;
    clone.style.width = "540px";
    clone.style.minWidth = "540px";
    clone.style.height = "340px";
    clone.style.position = "relative";
    clone.style.left = "0";
    clone.style.top = "0";
    normalizeCaptureStyles(clone);
    inlineResolvedStyles(element, clone);
    // Ensure exported side is front-facing (prevents mirrored back capture).
    clone.style.transform = "none";
    clone.style.backfaceVisibility = "visible";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await waitForImages(clone);
      return await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        allowTaint: true,
        width: 540,
        height: 340,
        windowWidth: 540,
        windowHeight: 340,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 15000,
      });
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const captureCardCanvasWithFallback = async (element: HTMLDivElement) => {
    try {
      return await captureCardCanvas(element);
    } catch {
      const originalTransform = element.style.transform;
      const originalBackface = element.style.backfaceVisibility;
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalHeight = element.style.height;

      element.style.transform = "none";
      element.style.backfaceVisibility = "visible";
      element.style.filter = "none";
      element.style.width = "540px";
      element.style.minWidth = "540px";
      element.style.height = "340px";
      normalizeCaptureStyles(element);

      try {
        const fallbackWrapper = document.createElement("div");
        fallbackWrapper.style.position = "fixed";
        fallbackWrapper.style.left = "-99999px";
        fallbackWrapper.style.top = "0";
        fallbackWrapper.style.width = "540px";
        fallbackWrapper.style.height = "340px";
        fallbackWrapper.style.zIndex = "-1";
        fallbackWrapper.style.pointerEvents = "none";

        const fallbackClone = element.cloneNode(true) as HTMLDivElement;
        normalizeCaptureStyles(fallbackClone);
        inlineResolvedStyles(element, fallbackClone);
        // Ensure exported side is front-facing (prevents mirrored back capture).
        fallbackClone.style.transform = "none";
        fallbackClone.style.backfaceVisibility = "visible";
        fallbackWrapper.appendChild(fallbackClone);
        document.body.appendChild(fallbackWrapper);

        await waitForImages(fallbackClone);
        const canvas = await html2canvas(fallbackClone, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
          allowTaint: true,
          width: 540,
          height: 340,
          windowWidth: 540,
          windowHeight: 340,
          scrollX: 0,
          scrollY: 0,
          imageTimeout: 15000,
        });
        document.body.removeChild(fallbackWrapper);
        return canvas;
      } finally {
        element.style.transform = originalTransform;
        element.style.backfaceVisibility = originalBackface;
        element.style.width = originalWidth;
        element.style.minWidth = originalMinWidth;
        element.style.height = originalHeight;
      }
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Delay revoke to avoid cancelling download in some browsers.
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  };

  const normalizeBackCanvasOrientation = (canvas: HTMLCanvasElement) => {
    // Keep exported back exactly as rendered on screen.
    return canvas;
  };

  const downloadJpgSide = async (side: "front" | "back") => {
    if (!member) return;
    const targetEl = side === "front" ? cardFrontRef.current : cardBackRef.current;
    if (!targetEl) return;

    try {
      const rawCanvas = await captureCardCanvasWithFallback(targetEl);
      const canvas = side === "back" ? normalizeBackCanvasOrientation(rawCanvas) : rawCanvas;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("Failed to create JPG blob"))),
          "image/jpeg",
          0.95,
        );
      });
      triggerBlobDownload(blob, `fasil-card-${member.membershipNumber}-${side}.jpg`);
      toast({ title: `${side === "front" ? "Front" : "Back"} JPG downloaded` });
    } catch (err: any) {
      toast({
        title: "JPG download failed",
        description: String(err?.message || "Capture failed"),
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardFrontRef.current || !cardBackRef.current || !member) return;

    try {
      const frontCanvas = await captureCardCanvasWithFallback(cardFrontRef.current);
      const backRawCanvas = await captureCardCanvasWithFallback(cardBackRef.current);
      const backCanvas = normalizeBackCanvasOrientation(backRawCanvas);

      const pageWidth = frontCanvas.width / 2;
      const pageHeight = frontCanvas.height / 2;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [pageWidth, pageHeight],
      });

      pdf.addImage(frontCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, pageHeight);
      pdf.addPage([pageWidth, pageHeight], "landscape");
      pdf.addImage(backCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, pageHeight);
      const pdfBlob = pdf.output("blob");
      triggerBlobDownload(pdfBlob, `fasil-card-${member.membershipNumber}-front-back.pdf`);
      toast({ title: "PDF saved successfully" });
    } catch (err: any) {
      toast({
        title: "PDF generation failed",
        description: String(err?.message || "PDF export failed"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchMemberData = async () => {
      const token = localStorage.getItem("memberToken");

      if (!token) {
        setLocation("/member/login");
        return;
      }

      try {
        const response = await fetch("/api/member/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("memberToken");
          localStorage.removeItem("memberData");
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          });
          setLocation("/member/login");
          return;
        }

        const data = await response.json();
        setMember(data);
        localStorage.setItem("memberData", JSON.stringify(data));
      } catch {
        localStorage.removeItem("memberToken");
        localStorage.removeItem("memberData");
        setLocation("/member/login");
      }
    };

    fetchMemberData();
  }, [setLocation, toast]);

  useEffect(() => {
    if (member?.tier) {
      setRenewTier(String(member.tier));
    }
  }, [member?.tier]);

  useEffect(() => {
    if (!isRenewPhoneEdited && member?.phone) {
      setRenewPhone(String(member.phone));
    }
  }, [member?.phone, isRenewPhoneEdited]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const renewal = searchParams.get("renewal");
    if (renewal !== "success" && renewal !== "failed" && renewal !== "pending") return;

    const token = localStorage.getItem("memberToken");
    window.history.replaceState({}, "", `${window.location.origin}/member/dashboard`);

    if (!token) {
      setLocation("/member/login");
      return;
    }

    if (renewal === "success") {
      toast({
        title: "Renewal successful",
        description: "Your membership has been renewed successfully.",
      });
      void refreshMemberData(token);
      return;
    }

    if (renewal === "pending") {
      toast({
        title: "Payment processing",
        description: "Your renewal is still being confirmed. Refresh this page in a moment.",
      });
      return;
    }

    toast({
      title: "Renewal could not be confirmed",
      description: "If you were charged, please contact support.",
      variant: "destructive",
    });
  }, [setLocation, toast, refreshMemberData]);

  const handleRenewMembership = async () => {
    if (!renewTier) {
      toast({ title: "Select membership tier", variant: "destructive" });
      return;
    }
    const token = localStorage.getItem("memberToken");
    if (!token) {
      setLocation("/member/login");
      return;
    }

    setIsRenewing(true);
    try {
      const response = await fetch("/api/member/renewal/initialize-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipTier: renewTier,
          currency: renewCurrency,
          billingCycle: "annual",
          chapaPhone: renewPhone.trim() || String(member?.phone || "").trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || result?.error) {
        throw new Error(result?.error || "Failed to initialize renewal payment");
      }
      if (result?.success && result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      throw new Error("Invalid renewal payment response");
    } catch (err: any) {
      toast({
        title: "Renewal failed",
        description: err?.message || "Could not start renewal payment.",
        variant: "destructive",
      });
      setIsRenewing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberData");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    setLocation("/");
  };

  const { data: branding } = useQuery<any[]>({
    queryKey: ["/api/public/branding"],
    staleTime: Infinity,
  });

  const brandingSettings = {
    signature:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.signature")?.value
        : null) || null,
    authorizedPersonName:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.authorizedPersonName")
            ?.value
        : null) || null,
    stamp:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.stamp")?.value
        : null) || null,
  };

  const selectedTemplateUrl = useMemo(() => {
    if (!member) return ID_CARD_TEMPLATE_DEFAULT;

    const normalize = (v: unknown) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/-level$/g, "")
        .replace(/level$/g, "")
        .replace(/-/g, "");

    const memberToken = normalize(member.tier);

    const tiersValue = membershipTiersSetting?.value;
    let tiers: any[] = [];
    if (Array.isArray(tiersValue)) {
      tiers = tiersValue;
    } else if (typeof tiersValue === "string") {
      try {
        const parsed = JSON.parse(tiersValue);
        if (Array.isArray(parsed)) tiers = parsed;
        else if (parsed && Array.isArray(parsed.tiers)) tiers = parsed.tiers;
      } catch {
        // Ignore parsing errors; fallback below.
      }
    } else if (
      tiersValue &&
      typeof tiersValue === "object" &&
      Array.isArray((tiersValue as any).tiers)
    ) {
      tiers = (tiersValue as any).tiers;
    }

    if (!tiers.length) {
      tiers = MEMBERSHIP_TIERS as any;
    }

    const extractEtb = (t: any) => {
      const v =
        t?.priceETB ??
        t?.priceEtb ??
        t?.price_etb ??
        t?.price?.etb ??
        t?.price?.ETB;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const memberLower = String(member.tier ?? "")
      .trim()
      .toLowerCase();

    const matchedTier = tiers.find((t: any) => {
      const idRaw = String(t?.id ?? "").trim();
      const nameRaw = String(t?.name ?? "").trim();

      const idLower = idRaw.toLowerCase();
      const nameLower = nameRaw.toLowerCase();

      if (memberLower && (memberLower === idLower || memberLower === nameLower))
        return true;

      const idNorm = normalize(idRaw);
      const nameNorm = normalize(nameRaw);

      if (memberToken && (memberToken === idNorm || memberToken === nameNorm))
        return true;

      return false;
    });

    const templateForTierId = (rawId: string) => {
      const key = rawId.trim().toLowerCase();
      return key ? ID_CARD_TEMPLATE_BY_TIER_ID[key] : undefined;
    };

    if (matchedTier) {
      const fromId = templateForTierId(String(matchedTier.id ?? ""));
      if (fromId) return fromId;
    }

    const direct = templateForTierId(memberLower);
    if (direct) return direct;

    for (const id of Object.keys(ID_CARD_TEMPLATE_BY_TIER_ID)) {
      if (memberToken && memberToken === normalize(id)) {
        return ID_CARD_TEMPLATE_BY_TIER_ID[id];
      }
    }

    let priceEtb = matchedTier ? extractEtb(matchedTier) : null;
    if (!priceEtb) {
      const m = String(member.tier ?? "").match(/\d+/);
      if (m) priceEtb = Number(m[0]);
    }

    if (priceEtb != null && Number.isFinite(priceEtb)) {
      const prices = ID_CARD_TIER_ORDER.map((t) => t.priceEtb);
      let bestIdx = 0;
      let bestDist = Math.abs(prices[0] - priceEtb);
      for (let i = 1; i < prices.length; i += 1) {
        const d = Math.abs(prices[i] - priceEtb);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      return ID_CARD_TEMPLATES_ORDERED[bestIdx] ?? ID_CARD_TEMPLATE_DEFAULT;
    }

    return ID_CARD_TEMPLATE_DEFAULT;
  }, [member, membershipTiersSetting]);

  const selectedCardTier = useMemo(() => {
    if (!member) return undefined;
    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/-level$/g, "")
        .replace(/level$/g, "")
        .replace(/-/g, "");
    const memberTier = normalize(member.tier);
    return membershipTierRows.find(
      (tier) =>
        normalize(tier.id) === memberTier ||
        normalize(tier.name) === memberTier ||
        normalize(tier.amharicVersion) === memberTier,
    );
  }, [member, membershipTierRows]);

  const frontCardBackgroundUrl =
    selectedCardTier?.frontBackgroundUrl || selectedTemplateUrl;

  if (!member) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center min-h-[40vh] flex items-center justify-center">
          በመጫን ላይ...
        </div>
      </PublicLayout>
    );
  }

  const expiryDate = new Date(member.expiryDate);
  const isExpired = expiryDate < new Date();
  const isCardLocked = member.status !== "active" || isExpired;

  return (
    <PublicLayout>
      <div className="container max-w-4xl mx-auto min-h-screen-safe px-3 sm:px-4 py-4 sm:py-8 pb-8 pt-safe">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
          <div className="min-w-0 pr-2">
            <h1 className="text-lg sm:text-xl font-bold text-red-700 leading-tight">
              የአባልነት መግቢያ
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-0.5">
              Member Dashboard
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50 shrink-0 self-start sm:self-auto"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> ውጣ
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center w-full min-w-0">
          {/* Flip card: fluid width, fixed aspect (540:340) — matches export dimensions ratio */}
          <div className="relative perspective-1000 w-full max-w-[540px] mx-auto touch-manipulation select-none">
            <div
              className={`relative w-full aspect-[540/340] max-w-[540px] transition-all duration-700 preserve-3d ${isCardLocked ? "cursor-not-allowed blur-[6px] grayscale" : "cursor-pointer active:scale-[0.99]"}`}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onClick={() => {
                if (!isCardLocked) {
                  setIsFlipped(!isFlipped);
                }
              }}
            >
              <div
                ref={cardFrontRef}
                className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="relative h-full w-full">
                  {frontCardBackgroundUrl && (
                    <img
                      src={frontCardBackgroundUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Dynamic overlay (member data only) */}
                  <div className="absolute inset-0">
                    {/* The card displays only the requested membership details. */}
                    <div className="absolute left-0 right-0 top-[62%] -translate-y-1/2 px-2.5 sm:px-6">
                      <div className="space-y-0.5 sm:space-y-1 text-[9px] sm:text-[11px] font-bold text-gray-800 max-w-[58%] sm:max-w-[320px]">
                        <div>
                          <p className="text-red-600 text-[8px] sm:text-[10px]">የአባልነት ቁጥር / Membership ID</p>
                          <p className="font-mono text-[10px] sm:text-sm leading-tight">
                            {member.membershipNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 text-[8px] sm:text-[10px]">ስም / Name</p>
                          <p className="text-[11px] sm:text-sm leading-tight break-words line-clamp-3 sm:line-clamp-none">
                            {member.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 text-[8px] sm:text-[10px]">ጾታ / Sex</p>
                          <p className="text-[11px] sm:text-sm leading-tight">
                            {member.gender || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 text-[8px] sm:text-[10px]">አድራሻ / Address</p>
                          <p className="text-[11px] sm:text-sm leading-tight break-words line-clamp-2 sm:line-clamp-none">
                            {member.address || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 text-[8px] sm:text-[10px]">ስልክ / Phone</p>
                          <p className="text-[11px] sm:text-sm leading-tight">
                            {member.phone}
                          </p>
                        </div>
                        <div className="mt-2.5 text-left font-extrabold leading-tight text-white drop-shadow-md">
                          <p className="text-[9px] sm:text-[11px]">
                            Membership: {selectedCardTier?.name || member.tier}
                          </p>
                          <p className="text-[9px] sm:text-[11px]">
                            Amount:{" "}
                            {selectedCardTier
                              ? `${Number(selectedCardTier.price.etb).toLocaleString()} ETB / year`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Front member photo on the right, vertically centered */}
                    <div className="absolute right-1.5 top-3/5 -translate-y-1/2 w-16 h-20 sm:right-6 sm:w-28 sm:h-32 border-2 border-red-600 rounded-md sm:rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          className="w-full h-full object-cover"
                          alt="Member"
                        />
                      ) : (
                        <User className="text-gray-400 w-7 h-7 sm:w-12 sm:h-12" />
                      )}
                    </div>
                    <div className="absolute right-1.5 bottom-1.5 sm:right-6 sm:bottom-2 rounded bg-white p-1 shadow-md">
                      <QRCode
                        value={`${window.location.origin}/card/${encodeURIComponent(member.membershipNumber)}`}
                        size={48}
                      />
                    </div>

                  </div>
                </div>
              </div>

              <div
                ref={cardBackRef}
                className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="relative h-full w-full">
                  {selectedTemplateUrl && (
                    <img
                      src={selectedTemplateUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {(brandingSettings.stamp ||
                    brandingSettings.signature ||
                    brandingSettings.authorizedPersonName) && (
                    <div className="absolute right-[7%] top-1/2 -translate-y-1/2 w-[30%] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
                      {brandingSettings.stamp && (
                        <img
                          src={brandingSettings.stamp}
                          alt="Official membership stamp"
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
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
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-800 leading-tight break-words">
                          {brandingSettings.authorizedPersonName}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* Flip Indicator */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isFlipped ? "ወደ ፊት ገጽ" : "ወደ ጀርባ ገጽ"} /{" "}
              {isFlipped ? "Show Front" : "Show Back"}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              * ካርዱን ለመገልበጥ ጠቅ ያድርጉ / Click on card to flip
            </p>
          </div>

          {/* Download Buttons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl w-full">
            <Button
              onClick={() => void downloadJpgSide("front")}
              className="flex-1 bg-red-600 hover:bg-red-700 h-12 shadow-lg"
            >
              <FileImage className="mr-2 h-5 w-5" /> Download Front as JPG
            </Button>
            <Button
              onClick={() => void downloadJpgSide("back")}
              className="flex-1 bg-red-600 hover:bg-red-700 h-12 shadow-lg"
            >
              <FileImage className="mr-2 h-5 w-5" /> Download Back as JPG
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50 h-12"
            >
              <FileText className="mr-2 h-5 w-5" /> Save Full Card as PDF
            </Button>
          </div>

          <div className="mt-8 w-full max-w-2xl bg-white rounded-xl border p-4 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-3">Renew Membership</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a tier to renew or upgrade with annual membership.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={renewTier} onValueChange={setRenewTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {availableTiers.map((tier) => {
                    const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString() : "0");
                    const label = `${tier.name} — ETB ${fmt(tier.priceEtbAnnual)}/year · USD ${fmt(tier.priceUsdAnnual)}/year`;
                    return (
                      <SelectItem key={tier.id} value={tier.id}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={renewCurrency} onValueChange={(v: "ETB" | "USD") => setRenewCurrency(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3">
              <Input
                placeholder="Chapa payment phone (editable)"
                value={renewPhone}
                onChange={(e) => {
                  setRenewPhone(e.target.value);
                  setIsRenewPhoneEdited(true);
                }}
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={handleRenewMembership}
                disabled={isRenewing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isRenewing ? "Processing..." : "Renew Membership Securely"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </PublicLayout>
  );
}
