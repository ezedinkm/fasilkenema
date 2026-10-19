import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Phone,
  Bell,
  Palette,
  Pencil,
  Check,
  MessageSquare,
  CreditCard,
  Globe,
} from "lucide-react";
import {
  LEGACY_SMS_PUBLIC_BASE_URL_SETTING_KEY,
  PUBLIC_SITE_BASE_URL_SETTING_KEY,
  SMS_ICONIC_SETTING_KEYS,
} from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/context";

const DEFAULT_THEME = {
  primaryColor: "#E31E24",
  secondaryColor: "#D4AF37",
  accentColor: "#1a1a2e",
};

function isValidHttpOrHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type TierPriceField =
  | "priceEtb"
  | "priceUsd"
  | "monthlyPriceEtb"
  | "monthlyPriceUsd";

const TIER_PRICE_FIELDS: TierPriceField[] = [
  "priceEtb",
  "priceUsd",
  "monthlyPriceEtb",
  "monthlyPriceUsd",
];

const TIER_PRICE_LABELS: [TierPriceField, string][] = [
  ["priceEtb", "Annual Price (ETB)"],
  ["priceUsd", "Annual Price (USD)"],
  ["monthlyPriceEtb", "Monthly Price (ETB)"],
  ["monthlyPriceUsd", "Monthly Price (USD)"],
];

function isUsdTierField(field: TierPriceField): boolean {
  return field === "priceUsd" || field === "monthlyPriceUsd";
}

/** Whole ETB amounts: digits only, preserves leading zeros while typing. */
function sanitizeMoneyIntegerInput(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** USD: digits and at most one decimal point. */
function sanitizeMoneyDecimalInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, "");
  const i = s.indexOf(".");
  if (i === -1) return s;
  return s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
}

function parseMoneyInt(s: string): number {
  if (s === "") return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseMoneyFloat(s: string): number {
  if (s === "" || s === ".") return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function tierPriceDraftKey(originalId: string, field: TierPriceField): string {
  return `${originalId}:${field}`;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token, refreshTheme } = useApp();

  // State for membership tiers
  const [tiers, setTiers] = useState<
    {
      originalId: string;
      id: string;
      amharicVersion: string;
      priceEtb: number;
      priceUsd: number;
      monthlyPriceEtb: number;
      monthlyPriceUsd: number;
    }[]
  >([]);
  const [isAddTierOpen, setIsAddTierOpen] = useState(false);
  const [editingTierOriginalId, setEditingTierOriginalId] = useState<
    string | null
  >(null);
  const [newTier, setNewTier] = useState({
    id: "",
    amharicVersion: "",
    priceEtb: "",
    priceUsd: "",
    monthlyPriceEtb: "",
    monthlyPriceUsd: "",
  });
  /** String drafts while editing tier prices (keeps leading zeros until blur / Done). */
  const [tierPriceDrafts, setTierPriceDrafts] = useState<
    Record<string, string>
  >({});

  // State for branding
  const [headerText, setHeaderText] = useState("FASIL S.C");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [stamp2Preview, setStamp2Preview] = useState<string | null>(null);
  const [authorizedPersonName, setAuthorizedPersonName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const stamp2InputRef = useRef<HTMLInputElement>(null);

  // State for donation tiers
  const [donationTiers, setDonationTiers] = useState<
    { id: number; amount: number; label: string; sortOrder: number }[]
  >([]);
  const [isAddDonationTierOpen, setIsAddDonationTierOpen] = useState(false);
  const [newDonationTier, setNewDonationTier] = useState({
    amount: "",
    label: "",
  });

  // State for notifications
  const [notificationPhone, setNotificationPhone] = useState("");
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(true);
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [newEmail, setNewEmail] = useState("");

  // State for theme
  const [themeColors, setThemeColors] = useState(DEFAULT_THEME);

  // State for general settings
  const [siteName, setSiteName] = useState("FASIL FC Fan Club");
  const [siteUrl, setSiteUrl] = useState("https://fasilfc.com");
  const [supportEmail, setSupportEmail] = useState("info@fasilfc.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // State for payment settings
  const [chapaPublicKey, setChapaPublicKey] = useState("");
  const [chapaSecretKey, setChapaSecretKey] = useState("");
  const [chapaWebhookUrl, setChapaWebhookUrl] = useState("");
  const [chapaSandboxMode, setChapaSandboxMode] = useState(true);
  const [chapaKeysConfigured, setChapaKeysConfigured] = useState(false);

  const [iconicSmsSenderId, setIconicSmsSenderId] = useState("");
  const [publicSiteBaseUrl, setPublicSiteBaseUrl] = useState("");

  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/settings"],
    staleTime: 0,
    enabled: !!token,
  });

  const { data: smsProviderStatus, refetch: refetchSmsProviderStatus } =
    useQuery<{ apiKeyConfigured: boolean }>({
      queryKey: ["/api/admin/sms/provider-status"],
      enabled: !!token,
      queryFn: async () => {
        const response = await fetch("/api/admin/sms/provider-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to check SMS configuration");
        }
        return response.json();
      },
    });

  const { data: membershipTiersData, refetch: refetchMembershipTiers } =
    useQuery<any[]>({
      queryKey: ["/api/admin/membership-tiers"],
      enabled: !!token,
      queryFn: async () => {
        const response = await fetch("/api/admin/membership-tiers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch membership tiers");
        }
        return response.json();
      },
    });

  const { data: donationTiersData, refetch: refetchDonationTiers } = useQuery<
    any[]
  >({
    queryKey: ["/api/admin/donation-tiers"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch("/api/admin/donation-tiers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch donation tiers");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (token) {
      refetchSettings();
      refetchMembershipTiers();
      refetchDonationTiers();
    }
  }, [token, refetchSettings, refetchMembershipTiers, refetchDonationTiers]);

  useEffect(() => {
    if (Array.isArray(membershipTiersData)) {
      setTiers(
        membershipTiersData.map((tier: any) => ({
          originalId: String(tier.id),
          id: String(tier.id),
          amharicVersion: String(tier.amharicVersion ?? ""),
          priceEtb: Number(tier.priceEtb) || 0,
          priceUsd: Number(tier.priceUsd) || 0,
          monthlyPriceEtb: Number(tier.monthlyPriceEtb) || 0,
          monthlyPriceUsd: Number(tier.monthlyPriceUsd) || 0,
        })),
      );
    }
  }, [membershipTiersData]);

  useEffect(() => {
    if (Array.isArray(donationTiersData)) {
      setDonationTiers(
        donationTiersData.map((tier: any) => ({
          id: Number(tier.id),
          amount: Number(tier.amount) || 0,
          label: String(tier.label ?? ""),
          sortOrder: Number(tier.sortOrder) || 0,
        })),
      );
    }
  }, [donationTiersData]);

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const headerTextSetting = settings.find(
        (s: any) => s.key === "branding.headerText",
      );
      const logoSetting = settings.find((s: any) => s.key === "branding.logo");
      const faviconSetting = settings.find(
        (s: any) => s.key === "branding.favicon",
      );
      const signatureSetting = settings.find(
        (s: any) => s.key === "branding.signature",
      );
      const stampSetting = settings.find(
        (s: any) => s.key === "branding.stamp",
      );
      const stamp2Setting = settings.find(
        (s: any) => s.key === "branding.stamp2",
      );
      const authorizedNameSetting = settings.find(
        (s: any) => s.key === "branding.authorizedPersonName",
      );

      if (headerTextSetting) setHeaderText(headerTextSetting.value);
      if (logoSetting) setLogoPreview(logoSetting.value);
      if (faviconSetting) setFaviconPreview(faviconSetting.value);
      if (signatureSetting) setSignaturePreview(signatureSetting.value);
      if (stampSetting) setStampPreview(stampSetting.value);
      if (stamp2Setting) setStamp2Preview(stamp2Setting.value);
      if (authorizedNameSetting)
        setAuthorizedPersonName(authorizedNameSetting.value);
      const notificationPhoneSetting = settings.find(
        (s: any) => s.key === "notifications.phone",
      );
      const smsEnabledSetting = settings.find(
        (s: any) => s.key === "notifications.smsEnabled",
      );
      const notificationEmailsSetting = settings.find(
        (s: any) => s.key === "notifications.emails",
      );
      const emailEnabledSetting = settings.find(
        (s: any) => s.key === "notifications.emailEnabled",
      );

      if (notificationPhoneSetting)
        setNotificationPhone(notificationPhoneSetting.value);
      if (smsEnabledSetting)
        setSmsNotificationsEnabled(
          smsEnabledSetting.value === "true" ||
            smsEnabledSetting.value === true,
        );

      if (notificationEmailsSetting) {
        try {
          const emails =
            typeof notificationEmailsSetting.value === "string"
              ? JSON.parse(notificationEmailsSetting.value)
              : notificationEmailsSetting.value;
          if (Array.isArray(emails)) {
            setNotificationEmails(emails);
          }
        } catch (e) {
          console.error("Failed to parse notification emails:", e);
        }
      }
      if (emailEnabledSetting)
        setEmailNotificationsEnabled(
          emailEnabledSetting.value === "true" ||
            emailEnabledSetting.value === true,
        );

      // Load theme settings
      const primaryColorSetting = settings.find(
        (s: any) => s.key === "theme.primaryColor",
      );
      const secondaryColorSetting = settings.find(
        (s: any) => s.key === "theme.secondaryColor",
      );
      const accentColorSetting = settings.find(
        (s: any) => s.key === "theme.accentColor",
      );

      setThemeColors({
        primaryColor: primaryColorSetting?.value || DEFAULT_THEME.primaryColor,
        secondaryColor:
          secondaryColorSetting?.value || DEFAULT_THEME.secondaryColor,
        accentColor: accentColorSetting?.value || DEFAULT_THEME.accentColor,
      });

      // Load general settings
      const siteNameSetting = settings.find(
        (s: any) => s.key === "general.siteName",
      );
      const siteUrlSetting = settings.find(
        (s: any) => s.key === "general.siteUrl",
      );
      const supportEmailSetting = settings.find(
        (s: any) => s.key === "general.supportEmail",
      );
      const maintenanceModeSetting = settings.find(
        (s: any) => s.key === "general.maintenanceMode",
      );

      if (siteNameSetting) setSiteName(siteNameSetting.value);
      if (siteUrlSetting) setSiteUrl(siteUrlSetting.value);
      if (supportEmailSetting) setSupportEmail(supportEmailSetting.value);
      if (maintenanceModeSetting)
        setMaintenanceMode(
          maintenanceModeSetting.value === "true" ||
            maintenanceModeSetting.value === true,
        );

      // Load payment settings
      const chapaPublicKeySetting = settings.find(
        (s: any) => s.key === "payments.chapa.publicKey",
      );
      const chapaSecretKeySetting = settings.find(
        (s: any) => s.key === "payments.chapa.secretKey",
      );
      const chapaWebhookSetting = settings.find(
        (s: any) => s.key === "payments.chapa.webhookUrl",
      );
      const chapaSandboxSetting = settings.find(
        (s: any) => s.key === "payments.chapa.sandboxMode",
      );

      if (chapaPublicKeySetting) setChapaPublicKey(chapaPublicKeySetting.value);
      if (chapaSecretKeySetting) setChapaSecretKey(chapaSecretKeySetting.value);
      if (chapaWebhookSetting) setChapaWebhookUrl(chapaWebhookSetting.value);
      if (chapaSandboxSetting)
        setChapaSandboxMode(
          chapaSandboxSetting.value === "true" ||
            chapaSandboxSetting.value === true,
        );

      // Mark as configured when DB values are set (or env fallback is used on server).
      setChapaKeysConfigured(
        !!(
          String(chapaPublicKeySetting?.value || "").trim() &&
          String(chapaSecretKeySetting?.value || "").trim() &&
          String(chapaWebhookSetting?.value || "").trim()
        ),
      );

      const senderIdSetting = settings.find(
        (s: any) => s.key === SMS_ICONIC_SETTING_KEYS.senderId,
      );
      const publicBaseUrlSetting =
        settings.find(
          (s: any) => s.key === PUBLIC_SITE_BASE_URL_SETTING_KEY,
        ) ??
        settings.find(
          (s: any) => s.key === LEGACY_SMS_PUBLIC_BASE_URL_SETTING_KEY,
        );
      setIconicSmsSenderId(String(senderIdSetting?.value ?? ""));
      setPublicSiteBaseUrl(String(publicBaseUrlSetting?.value ?? "").trim());
    }
  }, [settings]);

  const saveBrandingMutation = useMutation({
    mutationFn: async (setting: {
      key: string;
      value: any;
      description?: string;
      delete?: boolean;
    }) => {
      const authToken =
        localStorage.getItem("admin_token") || localStorage.getItem("token");

      if (!authToken) {
        throw new Error("Not authenticated. Please log in again.");
      }

      if (setting.delete) {
        const response = await fetch(`/api/settings/${setting.key}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        // Deleting a missing key should be treated as a no-op.
        if (response.status === 404) {
          return { success: true, ignored: true };
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to delete setting");
        }
        return response.json();
      } else {
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(setting),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to save setting");
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleUpdateTier = (
    originalId: string,
    field: "id" | "amharicVersion",
    value: any,
  ) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.originalId !== originalId) return t;
        if (field === "id")
          return { ...t, id: String(value).trim().toLowerCase() };
        return { ...t, amharicVersion: String(value) };
      }),
    );
  };

  const flushTierPriceDraftsForTier = (originalId: string) => {
    setTierPriceDrafts((prev) => {
      const next = { ...prev };
      const patch: Partial<Record<TierPriceField, number>> = {};
      for (const field of TIER_PRICE_FIELDS) {
        const k = tierPriceDraftKey(originalId, field);
        if (!(k in next)) continue;
        const raw = next[k];
        delete next[k];
        patch[field] = isUsdTierField(field)
          ? parseMoneyFloat(raw)
          : parseMoneyInt(raw);
      }
      if (Object.keys(patch).length > 0) {
        setTiers((ts) =>
          ts.map((t) => (t.originalId === originalId ? { ...t, ...patch } : t)),
        );
      }
      return next;
    });
  };

  const handleAddTier = async () => {
    const id = newTier.id.trim().toLowerCase();
    const amharicVersion = newTier.amharicVersion.trim();
    const priceEtb = parseInt(newTier.priceEtb) || 0;
    const priceUsd = parseFloat(newTier.priceUsd) || 0;
    const monthlyPriceEtb = parseInt(newTier.monthlyPriceEtb) || 0;
    const monthlyPriceUsd = parseFloat(newTier.monthlyPriceUsd) || 0;

    if (!id) {
      toast({
        title: "Error",
        description: "Tier ID is required",
        variant: "destructive",
      });
      return;
    }
    if (!amharicVersion) {
      toast({
        title: "Error",
        description: "Amharic version is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/membership-tiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          amharicVersion,
          priceEtb,
          priceUsd,
          monthlyPriceEtb,
          monthlyPriceUsd,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create membership tier");
      }
      await refetchMembershipTiers();
      setNewTier({
        id: "",
        amharicVersion: "",
        priceEtb: "",
        priceUsd: "",
        monthlyPriceEtb: "",
        monthlyPriceUsd: "",
      });
      setIsAddTierOpen(false);
      toast({ title: "Tier Added", description: `${id} has been added.` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add tier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTier = async (originalId: string) => {
    if (confirm("Are you sure you want to delete this membership tier?")) {
      try {
        const response = await fetch(
          `/api/admin/membership-tiers/${originalId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to delete tier");
        }
        await refetchMembershipTiers();
        toast({
          title: "Tier Deleted",
          description: "Membership tier removed.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete tier",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveMembershipTiers = async () => {
    try {
      const mergedTiers = tiers.map((tier) => {
        const patch: Partial<Record<TierPriceField, number>> = {};
        for (const field of TIER_PRICE_FIELDS) {
          const k = tierPriceDraftKey(tier.originalId, field);
          const raw = tierPriceDrafts[k];
          if (raw === undefined) continue;
          patch[field] = isUsdTierField(field)
            ? parseMoneyFloat(raw)
            : parseMoneyInt(raw);
        }
        return Object.keys(patch).length ? { ...tier, ...patch } : tier;
      });

      await Promise.all(
        mergedTiers.map((tier) =>
          fetch(`/api/admin/membership-tiers/${tier.originalId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: tier.id,
              amharicVersion: tier.amharicVersion,
              priceEtb: tier.priceEtb,
              priceUsd: tier.priceUsd,
              monthlyPriceEtb: tier.monthlyPriceEtb,
              monthlyPriceUsd: tier.monthlyPriceUsd,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(data.error || `Failed to update ${tier.id}`);
            }
          }),
        ),
      );
      setTierPriceDrafts({});
      setEditingTierOriginalId(null);
      await refetchMembershipTiers();
      toast({
        title: "Saved",
        description: "Membership pricing updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save membership pricing.",
        variant: "destructive",
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "File Too Large",
          description: "Logo must be under 500KB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "File Too Large",
          description: "Favicon must be under 500KB",
          variant: "destructive",
        });
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "File Too Large",
          description: "Signature image must be under 500KB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "File Too Large",
          description: "Stamp image must be under 500KB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStampPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStamp2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "File Too Large",
          description: "Stamp image must be under 500KB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStamp2Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    try {
      const mutations = [];

      if (headerText) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.headerText",
            value: headerText,
            description: "Site header text",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.headerText",
            value: "",
            delete: true,
          }),
        );
      }

      if (logoPreview) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.logo",
            value: logoPreview,
            description: "Site logo (base64)",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.logo",
            value: "",
            delete: true,
          }),
        );
      }

      if (faviconPreview) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.favicon",
            value: faviconPreview,
            description: "Site favicon (base64)",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.favicon",
            value: "",
            delete: true,
          }),
        );
      }

      if (signaturePreview) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.signature",
            value: signaturePreview,
            description: "Authorized person digital signature (base64)",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.signature",
            value: "",
            delete: true,
          }),
        );
      }

      if (authorizedPersonName) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.authorizedPersonName",
            value: authorizedPersonName,
            description: "Authorized person name for membership cards",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.authorizedPersonName",
            value: "",
            delete: true,
          }),
        );
      }

      if (stampPreview) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.stamp",
            value: stampPreview,
            description:
              "Circle stamp watermark image for membership cards (base64)",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.stamp",
            value: "",
            delete: true,
          }),
        );
      }

      if (stamp2Preview) {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.stamp2",
            value: stamp2Preview,
            description: "Second stamp image for membership cards (base64)",
          }),
        );
      } else {
        mutations.push(
          saveBrandingMutation.mutateAsync({
            key: "branding.stamp2",
            value: "",
            delete: true,
          }),
        );
      }

      await Promise.all(mutations);

      toast({
        title: "Branding Saved",
        description: "Your branding settings have been updated.",
      });
    } catch (error: any) {
      console.error("Branding save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save branding settings",
        variant: "destructive",
      });
    }
  };

  const handleAddDonationTier = async () => {
    if (!newDonationTier.amount || !newDonationTier.label) {
      toast({
        title: "Error",
        description: "Please enter both amount and label",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch("/api/admin/donation-tiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseInt(newDonationTier.amount),
          label: newDonationTier.label.trim(),
          sortOrder: donationTiers.length,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create donation tier");
      }
      await refetchDonationTiers();
      setNewDonationTier({ amount: "", label: "" });
      setIsAddDonationTierOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add donation tier",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDonationTier = (
    id: number | string,
    field: string,
    value: string,
  ) => {
    setDonationTiers(
      donationTiers.map((tier) => {
        if (String(tier.id) === id) {
          if (field === "amount") {
            return { ...tier, amount: parseInt(value) || 0 };
          } else if (field === "label") {
            return { ...tier, label: value };
          }
        }
        return tier;
      }),
    );
  };

  const handleDeleteDonationTier = async (id: number | string) => {
    if (donationTiers.length <= 1) {
      toast({
        title: "Error",
        description: "Must have at least one donation tier",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(`/api/admin/donation-tiers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete donation tier");
      }
      await refetchDonationTiers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete donation tier",
        variant: "destructive",
      });
    }
  };

  const handleSaveDonationTiers = async () => {
    try {
      await Promise.all(
        donationTiers.map((tier, index) =>
          fetch(`/api/admin/donation-tiers/${tier.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: tier.amount,
              label: tier.label,
              sortOrder: index,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(
                data.error || `Failed to update donation tier ${tier.id}`,
              );
            }
          }),
        ),
      );
      await refetchDonationTiers();
      toast({
        title: "Donation Tiers Saved",
        description: "Your donation amount options have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save donation tiers",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: "notifications.phone",
          value: notificationPhone,
          description: "Phone number for payment notifications",
        }),
        saveBrandingMutation.mutateAsync({
          key: "notifications.smsEnabled",
          value: smsNotificationsEnabled.toString(),
          description: "Enable/disable SMS notifications",
        }),
        saveBrandingMutation.mutateAsync({
          key: "notifications.emails",
          value: JSON.stringify(notificationEmails),
          description: "Email addresses for payment notifications",
        }),
        saveBrandingMutation.mutateAsync({
          key: "notifications.emailEnabled",
          value: emailNotificationsEnabled.toString(),
          description: "Enable/disable email notifications",
        }),
      ]);
      toast({
        title: "Notifications Saved",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    }
  };

  const handleSavePublicSiteBaseUrl = async () => {
    const trimmed = publicSiteBaseUrl.trim().replace(/\/+$/, "");
    if (trimmed && !isValidHttpOrHttpsUrl(trimmed)) {
      toast({
        title: "Invalid URL",
        description: "Enter a full URL such as https://yourdomain.com",
        variant: "destructive",
      });
      return;
    }

    try {
      if (trimmed) {
        await saveBrandingMutation.mutateAsync({
          key: PUBLIC_SITE_BASE_URL_SETTING_KEY,
          value: trimmed,
          description: "Public site base URL for Chapa return/callback links",
        });
      } else {
        await saveBrandingMutation.mutateAsync({
          key: PUBLIC_SITE_BASE_URL_SETTING_KEY,
          value: "",
          delete: true,
        });
      }
      toast({
        title: "Public URL saved",
        description: trimmed
          ? "Server will use this for payment redirects. Clear the field to use APP_BASE_URL or the request host."
          : "Cleared. Server falls back to APP_BASE_URL, then the incoming request host.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save public base URL",
        variant: "destructive",
      });
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      const trimmedPublicKey = chapaPublicKey.trim();
      const trimmedSecretKey = chapaSecretKey.trim();
      const trimmedWebhookUrl = chapaWebhookUrl.trim();

      const promises = [
        saveBrandingMutation.mutateAsync({
          key: "payments.chapa.sandboxMode",
          value: chapaSandboxMode.toString(),
          description: "Enable/disable Chapa sandbox mode",
        }),
      ];

      if (trimmedWebhookUrl) {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.webhookUrl",
            value: trimmedWebhookUrl,
            description: "Chapa webhook URL for payment callbacks",
          }),
        );
      } else {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.webhookUrl",
            value: "",
            delete: true,
          }),
        );
      }

      if (trimmedPublicKey) {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.publicKey",
            value: trimmedPublicKey,
            description: "Chapa public key",
          }),
        );
      } else {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.publicKey",
            value: "",
            delete: true,
          }),
        );
      }

      if (trimmedSecretKey) {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.secretKey",
            value: trimmedSecretKey,
            description: "Chapa secret key",
          }),
        );
      } else {
        promises.push(
          saveBrandingMutation.mutateAsync({
            key: "payments.chapa.secretKey",
            value: "",
            delete: true,
          }),
        );
      }

      await Promise.all(promises);
      setChapaKeysConfigured(
        !!(trimmedPublicKey && trimmedSecretKey && trimmedWebhookUrl),
      );
      toast({
        title: "Payment Settings Saved",
        description:
          "Chapa settings saved. Empty fields will use .env fallback on server.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveSmsGatewaySettings = async () => {
    try {
      const senderId = iconicSmsSenderId.trim();
      await saveBrandingMutation.mutateAsync(
        senderId
          ? {
              key: SMS_ICONIC_SETTING_KEYS.senderId,
              value: senderId,
              description: "Optional IconicSMS sender shortcode ID",
            }
          : {
              key: SMS_ICONIC_SETTING_KEYS.senderId,
              value: "",
              delete: true,
            },
      );
      await Promise.all(
        ["sms.geez.id", "sms.geez.token", "sms.geez.sender"].map((key) =>
          saveBrandingMutation.mutateAsync({ key, value: "", delete: true }),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ["/api/settings"],
      });
      await refetchSmsProviderStatus();
      toast({
        title: "SMS settings saved",
        description: smsProviderStatus?.apiKeyConfigured
          ? "IconicSMS is ready to accept messages."
          : "Add ICONIC_SMS_API_KEY in Replit Secrets to enable SMS sending.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save SMS gateway settings",
        variant: "destructive",
      });
    }
  };

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (notificationEmails.includes(trimmedEmail)) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in the list",
        variant: "destructive",
      });
      return;
    }

    setNotificationEmails([...notificationEmails, trimmedEmail]);
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setNotificationEmails(notificationEmails.filter((e) => e !== email));
  };

  const handleSaveTheme = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: "theme.primaryColor",
          value: themeColors.primaryColor,
          description: "Primary theme color",
        }),
        saveBrandingMutation.mutateAsync({
          key: "theme.secondaryColor",
          value: themeColors.secondaryColor,
          description: "Secondary theme color",
        }),
        saveBrandingMutation.mutateAsync({
          key: "theme.accentColor",
          value: themeColors.accentColor,
          description: "Accent theme color",
        }),
      ]);

      // Apply theme immediately across all pages
      refreshTheme();

      toast({
        title: "Theme Saved",
        description: "Your theme colors have been updated across all pages.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: "general.siteName",
          value: siteName,
          description: "Site name",
        }),
        saveBrandingMutation.mutateAsync({
          key: "general.siteUrl",
          value: siteUrl,
          description: "Site URL",
        }),
        saveBrandingMutation.mutateAsync({
          key: "general.supportEmail",
          value: supportEmail,
          description: "Support email",
        }),
        saveBrandingMutation.mutateAsync({
          key: "general.maintenanceMode",
          value: maintenanceMode.toString(),
          description: "Maintenance mode",
        }),
      ]);
      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
            System Settings
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Configure platform preferences and integrations.
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full min-w-0">
          <TabsList className="mb-4 flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 sm:flex-wrap sm:overflow-visible">
            {/* <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger> */}
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="membership">Membership Fees</TabsTrigger>
            <TabsTrigger value="donations">Donation Tiers</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payments">Payments &amp; SMS</TabsTrigger>
            {/* <TabsTrigger value="security">Security</TabsTrigger> */}
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic configuration for the fan club platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    data-testid="input-site-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    data-testid="input-site-url"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    data-testid="input-support-email"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Disable public access to the site.
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                    data-testid="switch-maintenance-mode"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveGeneral}
                  data-testid="button-save-general"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Theme
                </CardTitle>
                <CardDescription>
                  Customize the color scheme across your entire website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.primaryColor}
                        onChange={(e) =>
                          setThemeColors({
                            ...themeColors,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.primaryColor}
                          onChange={(e) =>
                            setThemeColors({
                              ...themeColors,
                              primaryColor: e.target.value,
                            })
                          }
                          placeholder="#E31E24"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for buttons, links, and accents
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.secondaryColor}
                        onChange={(e) =>
                          setThemeColors({
                            ...themeColors,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-secondary-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.secondaryColor}
                          onChange={(e) =>
                            setThemeColors({
                              ...themeColors,
                              secondaryColor: e.target.value,
                            })
                          }
                          placeholder="#D4AF37"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for highlights and badges
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.accentColor}
                        onChange={(e) =>
                          setThemeColors({
                            ...themeColors,
                            accentColor: e.target.value,
                          })
                        }
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-accent-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.accentColor}
                          onChange={(e) =>
                            setThemeColors({
                              ...themeColors,
                              accentColor: e.target.value,
                            })
                          }
                          placeholder="#1a1a2e"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for dark backgrounds
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Preview</Label>
                  <div className="p-6 rounded-lg border bg-zinc-50">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        style={{
                          backgroundColor: themeColors.primaryColor,
                          color: "white",
                        }}
                      >
                        Primary Button
                      </Button>
                      <Button
                        style={{
                          backgroundColor: themeColors.secondaryColor,
                          color: "black",
                        }}
                      >
                        Secondary Button
                      </Button>
                      <div
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: themeColors.accentColor }}
                      >
                        Accent Background
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setThemeColors(DEFAULT_THEME)}
                    data-testid="button-reset-theme"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset to Default
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveTheme}
                  data-testid="button-save-theme"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Theme
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Appearance</CardTitle>
                <CardDescription>
                  Customize your site logo, favicon, and header text.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="header-text">Header Text</Label>
                    <Input
                      id="header-text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="Fasil Kenema Fan Club"
                      data-testid="input-header-text"
                    />
                    <p className="text-xs text-muted-foreground">
                      This text appears in the site header/navigation
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Site Logo</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Upload a logo to display in the navigation (recommended:
                        PNG, max 200KB)
                      </p>
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-32 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center bg-zinc-50">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="max-w-full max-h-full object-contain p-2"
                            />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-zinc-400" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoChange}
                            accept="image/png,image/jpeg,image/svg+xml"
                            className="hidden"
                            data-testid="input-logo-file"
                          />
                          <Button
                            variant="outline"
                            onClick={() => logoInputRef.current?.click()}
                            data-testid="button-upload-logo"
                          >
                            <Upload className="mr-2 h-4 w-4" /> Choose Logo
                          </Button>
                          {logoPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLogoPreview(null)}
                              data-testid="button-remove-logo"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Favicon</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Upload a favicon for browser tabs (recommended: 32x32px
                        PNG or ICO, max 50KB)
                      </p>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center bg-zinc-50">
                          {faviconPreview ? (
                            <img
                              src={faviconPreview}
                              alt="Favicon preview"
                              className="max-w-full max-h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-zinc-300 rounded-sm"></div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={faviconInputRef}
                            onChange={handleFaviconChange}
                            accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                            className="hidden"
                            data-testid="input-favicon-file"
                          />
                          <Button
                            variant="outline"
                            onClick={() => faviconInputRef.current?.click()}
                            data-testid="button-upload-favicon"
                          >
                            <Upload className="mr-2 h-4 w-4" /> Choose Favicon
                          </Button>
                          {faviconPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFaviconPreview(null)}
                              data-testid="button-remove-favicon"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Digital Signature (Authorized Person)</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a signature image to appear as watermark on
                      membership cards (recommended: transparent PNG, max 500KB)
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="w-40 h-20 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center bg-zinc-50">
                        {signaturePreview ? (
                          <img
                            src={signaturePreview}
                            alt="Signature preview"
                            className="max-w-full max-h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-xs text-zinc-400">
                            No Signature
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={signatureInputRef}
                          onChange={handleSignatureChange}
                          accept="image/png,image/jpeg"
                          className="hidden"
                          data-testid="input-signature-file"
                        />
                        <Button
                          variant="outline"
                          onClick={() => signatureInputRef.current?.click()}
                          data-testid="button-upload-signature"
                        >
                          <Upload className="mr-2 h-4 w-4" /> Choose Signature
                        </Button>
                        {signaturePreview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSignaturePreview(null)}
                            data-testid="button-remove-signature"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="authorized-person">
                      Authorized Person Name
                    </Label>
                    <Input
                      id="authorized-person"
                      value={authorizedPersonName}
                      onChange={(e) => setAuthorizedPersonName(e.target.value)}
                      placeholder="Enter authorized person's name"
                      data-testid="input-authorized-person"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name appears below the signature on membership cards
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label>Stamp 1 / Seal Watermark</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a circular stamp or seal image (recommended:
                      transparent PNG, max 500KB)
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center bg-zinc-50 overflow-hidden">
                        {stampPreview ? (
                          <img
                            src={stampPreview}
                            alt="Stamp preview"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-zinc-400 text-center px-2">
                            No Stamp
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={stampInputRef}
                          onChange={handleStampChange}
                          accept="image/png,image/jpeg"
                          className="hidden"
                          data-testid="input-stamp-file"
                        />
                        <Button
                          variant="outline"
                          onClick={() => stampInputRef.current?.click()}
                          data-testid="button-upload-stamp"
                        >
                          <Upload className="mr-2 h-4 w-4" /> Choose Stamp 1
                        </Button>
                        {stampPreview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStampPreview(null)}
                            data-testid="button-remove-stamp"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Stamp 2 / Second Seal</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a second stamp or seal image for membership cards
                      (recommended: transparent PNG, max 500KB)
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center bg-zinc-50 overflow-hidden">
                        {stamp2Preview ? (
                          <img
                            src={stamp2Preview}
                            alt="Stamp 2 preview"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-zinc-400 text-center px-2">
                            No Stamp
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={stamp2InputRef}
                          onChange={handleStamp2Change}
                          accept="image/png,image/jpeg"
                          className="hidden"
                          data-testid="input-stamp2-file"
                        />
                        <Button
                          variant="outline"
                          onClick={() => stamp2InputRef.current?.click()}
                          data-testid="button-upload-stamp2"
                        >
                          <Upload className="mr-2 h-4 w-4" /> Choose Stamp 2
                        </Button>
                        {stamp2Preview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStamp2Preview(null)}
                            data-testid="button-remove-stamp2"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveBranding}
                  data-testid="button-save-branding"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Branding
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Membership Tiers & Pricing</CardTitle>
                  <CardDescription>
                    Update annual and monthly membership pricing.
                  </CardDescription>
                </div>
                <Dialog open={isAddTierOpen} onOpenChange={setIsAddTierOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tier ID</Label>
                        <Input
                          value={newTier.id}
                          onChange={(e) =>
                            setNewTier({ ...newTier, id: e.target.value })
                          }
                          placeholder="e.g. gold-level"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amharic Version</Label>
                        <Input
                          value={newTier.amharicVersion}
                          onChange={(e) =>
                            setNewTier({
                              ...newTier,
                              amharicVersion: e.target.value,
                            })
                          }
                          placeholder="e.g. የወርቅ ደረጃ"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Annual Price (ETB)</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={newTier.priceEtb}
                            onChange={(e) =>
                              setNewTier({
                                ...newTier,
                                priceEtb: sanitizeMoneyIntegerInput(
                                  e.target.value,
                                ),
                              })
                            }
                            placeholder="0"
                            className="tabular-nums"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Annual Price (USD)</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={newTier.priceUsd}
                            onChange={(e) =>
                              setNewTier({
                                ...newTier,
                                priceUsd: sanitizeMoneyDecimalInput(
                                  e.target.value,
                                ),
                              })
                            }
                            placeholder="0"
                            className="tabular-nums"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Monthly Price (ETB)</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={newTier.monthlyPriceEtb}
                            onChange={(e) =>
                              setNewTier({
                                ...newTier,
                                monthlyPriceEtb: sanitizeMoneyIntegerInput(
                                  e.target.value,
                                ),
                              })
                            }
                            placeholder="0"
                            className="tabular-nums"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Monthly Price (USD)</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={newTier.monthlyPriceUsd}
                            onChange={(e) =>
                              setNewTier({
                                ...newTier,
                                monthlyPriceUsd: sanitizeMoneyDecimalInput(
                                  e.target.value,
                                ),
                              })
                            }
                            placeholder="0"
                            className="tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddTierOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddTier}>Add Tier</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="space-y-4 p-4 border rounded-lg relative group bg-zinc-50/50"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <Input
                          value={tier.id}
                          readOnly={editingTierOriginalId !== tier.originalId}
                          onChange={(e) =>
                            handleUpdateTier(
                              tier.originalId,
                              "id",
                              e.target.value,
                            )
                          }
                          className="font-bold text-lg bg-transparent border-transparent hover:border-input focus:border-input px-0 h-auto"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (editingTierOriginalId === tier.originalId) {
                                flushTierPriceDraftsForTier(tier.originalId);
                                setEditingTierOriginalId(null);
                                return;
                              }
                              if (editingTierOriginalId) {
                                flushTierPriceDraftsForTier(
                                  editingTierOriginalId,
                                );
                              }
                              setEditingTierOriginalId(tier.originalId);
                            }}
                            data-testid={`button-edit-tier-${tier.originalId}`}
                          >
                            {editingTierOriginalId === tier.originalId ? (
                              <>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Done
                              </>
                            ) : (
                              <>
                                <Pencil className="mr-1 h-3.5 w-3.5" />
                                Edit
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteTier(tier.originalId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Amharic Version</Label>
                        <Input
                          value={tier.amharicVersion}
                          readOnly={editingTierOriginalId !== tier.originalId}
                          onChange={(e) =>
                            handleUpdateTier(
                              tier.originalId,
                              "amharicVersion",
                              e.target.value,
                            )
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {TIER_PRICE_LABELS.map(([field, label]) => {
                          const key = tierPriceDraftKey(tier.originalId, field);
                          const draft = tierPriceDrafts[key];
                          const isUsd = isUsdTierField(field);
                          const num = tier[field];
                          const editing =
                            editingTierOriginalId === tier.originalId;
                          const displayValue = !editing
                            ? String(num)
                            : draft !== undefined
                              ? draft
                              : num === 0
                                ? ""
                                : String(num);
                          const sanitize = isUsd
                            ? sanitizeMoneyDecimalInput
                            : sanitizeMoneyIntegerInput;
                          return (
                            <div className="space-y-2" key={field}>
                              <Label>{label}</Label>
                              <Input
                                type="text"
                                inputMode={isUsd ? "decimal" : "numeric"}
                                autoComplete="off"
                                placeholder="0"
                                value={displayValue}
                                readOnly={!editing}
                                className="bg-white tabular-nums"
                                onFocus={() => {
                                  if (!editing) return;
                                  setTierPriceDrafts((d) => ({
                                    ...d,
                                    [key]: num === 0 ? "" : String(num),
                                  }));
                                }}
                                onChange={(e) => {
                                  if (!editing) return;
                                  setTierPriceDrafts((d) => ({
                                    ...d,
                                    [key]: sanitize(e.target.value),
                                  }));
                                }}
                                onBlur={() => {
                                  if (!editing) return;
                                  setTierPriceDrafts((d) => {
                                    if (!(key in d)) return d;
                                    const raw = d[key];
                                    const numVal = isUsd
                                      ? parseMoneyFloat(raw)
                                      : parseMoneyInt(raw);
                                    setTiers((ts) =>
                                      ts.map((t) =>
                                        t.originalId === tier.originalId
                                          ? { ...t, [field]: numVal }
                                          : t,
                                      ),
                                    );
                                    const { [key]: _, ...rest } = d;
                                    return rest;
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveMembershipTiers}
                >
                  <Save className="mr-2 h-4 w-4" /> Update Pricing
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Donation Amount Tiers</CardTitle>
                  <CardDescription>
                    Configure suggested donation amounts shown to users.
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddDonationTierOpen}
                  onOpenChange={setIsAddDonationTierOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      data-testid="button-add-donation-tier"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Donation Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Amount (ETB)</Label>
                        <Input
                          type="number"
                          value={newDonationTier.amount}
                          onChange={(e) =>
                            setNewDonationTier({
                              ...newDonationTier,
                              amount: e.target.value,
                            })
                          }
                          placeholder="e.g. 2500"
                          data-testid="input-new-donation-amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Label</Label>
                        <Input
                          value={newDonationTier.label}
                          onChange={(e) =>
                            setNewDonationTier({
                              ...newDonationTier,
                              label: e.target.value,
                            })
                          }
                          placeholder="e.g. 2,500 ETB"
                          data-testid="input-new-donation-label"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDonationTierOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddDonationTier}
                        data-testid="button-confirm-add-donation-tier"
                      >
                        Add Tier
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {donationTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="space-y-3 p-4 border rounded-lg relative group bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-lg text-primary">
                          {tier.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteDonationTier(tier.id)}
                          data-testid={`button-delete-donation-tier-${tier.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          value={tier.amount}
                          onChange={(e) =>
                            handleUpdateDonationTier(
                              tier.id,
                              "amount",
                              e.target.value,
                            )
                          }
                          className="bg-white h-8 text-sm"
                          data-testid={`input-donation-amount-${tier.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={tier.label}
                          onChange={(e) =>
                            handleUpdateDonationTier(
                              tier.id,
                              "label",
                              e.target.value,
                            )
                          }
                          className="bg-white h-8 text-sm"
                          data-testid={`input-donation-label-${tier.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Users will see these suggested amounts plus a "Custom" option
                  on the donation page.
                </p>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveDonationTiers}
                  data-testid="button-save-donation-tiers"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Donation Tiers
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>
                  Configure SMS notifications for payment events.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Send SMS alerts when payments are received.
                    </p>
                  </div>
                  <Switch
                    checked={smsNotificationsEnabled}
                    onCheckedChange={setSmsNotificationsEnabled}
                    data-testid="switch-sms-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="notification-phone"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Notification Phone Number
                    </Label>
                    <Input
                      id="notification-phone"
                      placeholder="e.g. +251912345678 or 0912345678"
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      data-testid="input-notification-phone"
                    />
                    <p className="text-xs text-muted-foreground">
                      This number will receive SMS notifications for all
                      membership and donation payments.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">
                    SMS Notification Preview
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    "New Membership Payment Received! Amount: 500 ETB. Fasil
                    Kenema Fan Club."
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-blue-800">
                    IconicSMS Integration
                  </h4>
                  <p className="text-xs text-blue-700">
                    SMS is sent through IconicSMS. Add{" "}
                    <span className="font-medium">ICONIC_SMS_API_KEY</span> to
                    Replit Secrets, then optionally set an approved sender ID
                    in the <span className="font-medium">Payments &amp; SMS</span>{" "}
                    tab.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Configure email notifications for payment events using Resend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Send email alerts when payments are received.
                    </p>
                  </div>
                  <Switch
                    checked={emailNotificationsEnabled}
                    onCheckedChange={setEmailNotificationsEnabled}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Notification Email Addresses
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Add multiple email addresses to receive payment
                      notifications.
                    </p>

                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. admin@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                        data-testid="input-notification-email"
                      />
                      <Button
                        variant="outline"
                        onClick={handleAddEmail}
                        data-testid="button-add-email"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>

                    {notificationEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {notificationEmails.map((email) => (
                          <Badge
                            key={email}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {email}
                            <button
                              onClick={() => handleRemoveEmail(email)}
                              className="ml-1 hover:text-red-500"
                              data-testid={`button-remove-email-${email}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {notificationEmails.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No email addresses added yet. Add at least one email to
                        receive notifications.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">
                    Email Notification Preview
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Subject: "New Donation Payment - Ethiopian FASIL FC Fan
                    Club"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails include payment details and current total revenue.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-purple-800">
                    Resend Integration
                  </h4>
                  <p className="text-xs text-purple-700">
                    Email notifications are sent via Resend. The integration is
                    configured and ready to use.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveNotifications}
                  data-testid="button-save-notifications"
                >
                  <Save className="mr-2 h-4 w-4" /> Save All Notification
                  Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments &amp; SMS</CardTitle>
                <CardDescription>
                  Payment gateways, public site URL, and IconicSMS settings.
                  Chapa keys use{" "}
                  <span className="font-mono text-xs">CHAPA_*</span>. The public
                  base URL overrides{" "}
                  <span className="font-mono text-xs">APP_BASE_URL</span> for
                  payment redirects when set.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="w-full min-w-0 space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-white">
                        <Globe className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold leading-tight">
                          Public base URL
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Canonical site origin for Chapa return and callback
                          URLs
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        publicSiteBaseUrl.trim()
                          ? "shrink-0 bg-green-500 hover:bg-green-500"
                          : "shrink-0 bg-zinc-400 hover:bg-zinc-400"
                      }
                    >
                      {publicSiteBaseUrl.trim() ? "Database" : "Fallback"}
                    </Badge>
                  </div>
                  <div className="grid gap-2 border-t border-zinc-200/60 pt-4">
                    <Label htmlFor="public-site-base-url">Base URL</Label>
                    <Input
                      id="public-site-base-url"
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      value={publicSiteBaseUrl}
                      onChange={(e) => setPublicSiteBaseUrl(e.target.value)}
                      placeholder="https://yourdomain.com"
                      className="font-mono text-sm min-w-0"
                      data-testid="input-public-site-base-url"
                    />
                    <p className="text-xs text-muted-foreground break-words">
                      No trailing path — origin only. Empty → server uses{" "}
                      <span className="font-mono">APP_BASE_URL</span>, then{" "}
                      <span className="font-mono">request host</span>. Saved
                      separately from Chapa and SMS credentials.
                    </p>
                  </div>
                </div>

                <div className="grid gap-10 xl:grid-cols-2 xl:gap-12">
                  {/* Payment gateways */}
                  <div className="space-y-6 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                      <CreditCard
                        className="h-4 w-4 shrink-0 text-zinc-600"
                        aria-hidden
                      />
                      Payment gateways
                    </div>

                    <div className="space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
                            CH
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold leading-tight">Chapa</h4>
                            <p className="text-xs text-muted-foreground">
                              Primary gateway for ETB / USD
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            chapaKeysConfigured
                              ? "shrink-0 bg-green-500 hover:bg-green-500"
                              : "shrink-0 bg-amber-500 hover:bg-amber-500"
                          }
                        >
                          {chapaKeysConfigured ? "Active" : "Not configured"}
                        </Badge>
                      </div>

                      <div className="grid gap-3 border-t border-zinc-200/60 pt-4">
                        <div className="grid gap-2">
                          <Label htmlFor="chapa-public-key">Public key</Label>
                          <Input
                            id="chapa-public-key"
                            type="text"
                            value={chapaPublicKey}
                            onChange={(e) => setChapaPublicKey(e.target.value)}
                            placeholder="CHAPUBK-xxxxxxxxxxxxxxxx"
                            className="font-mono text-sm"
                            data-testid="input-chapa-public-key"
                          />
                          <p className="text-xs text-muted-foreground">
                            From your Chapa dashboard. Empty → server uses{" "}
                            <span className="font-mono">CHAPA_PUBLIC_KEY</span>
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="chapa-secret-key">Secret key</Label>
                          <Input
                            id="chapa-secret-key"
                            type="password"
                            value={chapaSecretKey}
                            onChange={(e) => setChapaSecretKey(e.target.value)}
                            placeholder="CHASECK-xxxxxxxxxxxxxxxx"
                            className="font-mono text-sm"
                            data-testid="input-chapa-secret-key"
                          />
                          <p className="text-xs text-muted-foreground">
                            Empty →{" "}
                            <span className="font-mono">CHAPA_SECRET_KEY</span>
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="chapa-webhook">Webhook URL</Label>
                          <Input
                            id="chapa-webhook"
                            type="text"
                            value={chapaWebhookUrl}
                            onChange={(e) => setChapaWebhookUrl(e.target.value)}
                            placeholder="https://yoursite.com/api/chapa/callback"
                            className="font-mono text-sm"
                            data-testid="input-chapa-webhook-url"
                          />
                          <p className="text-xs text-muted-foreground">
                            Register in Chapa. Empty →{" "}
                            <span className="font-mono">CHAPA_WEBHOOK_URL</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Switch
                            id="sandbox"
                            checked={chapaSandboxMode}
                            onCheckedChange={setChapaSandboxMode}
                            data-testid="switch-chapa-sandbox"
                          />
                          <Label
                            htmlFor="sandbox"
                            className="cursor-pointer font-normal"
                          >
                            Sandbox mode
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 p-4 opacity-60">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                            PP
                          </div>
                          <div>
                            <h4 className="font-bold leading-tight">PayPal</h4>
                            <p className="text-xs text-muted-foreground">
                              International donations (coming soon)
                            </p>
                          </div>
                        </div>
                        <Switch disabled aria-label="PayPal coming soon" />
                      </div>
                    </div>
                  </div>

                  {/* SMS gateway */}
                  <div className="space-y-6 min-w-0 xl:border-l xl:border-zinc-200 xl:pl-10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                      <MessageSquare
                        className="h-4 w-4 shrink-0 text-zinc-600"
                        aria-hidden
                      />
                      SMS gateway
                    </div>

                    <div className="space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                            IC
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold leading-tight">
                              IconicSMS
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              OTP, alerts, and member SMS
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            smsProviderStatus?.apiKeyConfigured
                              ? "shrink-0 bg-green-500 hover:bg-green-500"
                              : "shrink-0 bg-amber-500 hover:bg-amber-500"
                          }
                        >
                          {smsProviderStatus?.apiKeyConfigured
                            ? "Active"
                            : "API key required"}
                        </Badge>
                      </div>

                      <div className="grid gap-3 border-t border-zinc-200/60 pt-4">
                        <div className="grid gap-2">
                          <Label htmlFor="iconic-sms-sender">
                            Sender ID (optional)
                          </Label>
                          <Input
                            id="iconic-sms-sender"
                            type="text"
                            value={iconicSmsSenderId}
                            onChange={(e) =>
                              setIconicSmsSenderId(e.target.value)
                            }
                            placeholder="Approved sender name or shortcode ID"
                            className="font-mono text-sm"
                            data-testid="input-iconic-sms-sender"
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground border-t border-zinc-200/60 pt-3">
                        Store the API key as the Replit Secret{" "}
                        <span className="font-mono">ICONIC_SMS_API_KEY</span>.
                        The key stays on the server; without a sender ID,
                        IconicSMS uses your account default.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[11rem] order-3 sm:order-1"
                  onClick={handleSavePublicSiteBaseUrl}
                  disabled={saveBrandingMutation.isPending}
                  data-testid="button-save-public-base-url"
                >
                  <Globe className="mr-2 h-4 w-4 shrink-0" />
                  Save public URL
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[11rem] order-2 sm:order-2"
                  onClick={handleSaveSmsGatewaySettings}
                  disabled={saveBrandingMutation.isPending}
                  data-testid="button-save-sms-gateway"
                >
                  <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                  Save SMS gateway
                </Button>
                <Button
                  className="w-full sm:w-auto sm:min-w-[11rem] bg-primary hover:bg-primary/90 order-1 sm:order-3"
                  onClick={handleSavePaymentSettings}
                  disabled={saveBrandingMutation.isPending}
                  data-testid="button-save-payments"
                >
                  <Save className="mr-2 h-4 w-4 shrink-0" />
                  Save payment settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
