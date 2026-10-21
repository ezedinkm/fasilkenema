import {
  Camera,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Music,
  Send,
  Twitter,
  Video,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import {
  socialLinksSettingSchema,
  type SocialIconName,
  type SocialLink,
} from "@shared/socialLinks";

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "default-facebook",
    name: "Facebook",
    url: "https://web.facebook.com/FKSCOfficial/?_rdc=1&_rdr",
    icon: "facebook",
  },
  {
    id: "default-twitter",
    name: "X (Twitter)",
    url: "https://x.com/fcfasil",
    icon: "twitter",
  },
  {
    id: "default-instagram",
    name: "Instagram",
    url: "https://www.instagram.com/fasil_kenema_sc?igsh=MTgyZXVrbHA4ZWxxcg==",
    icon: "instagram",
  },
];

export const SOCIAL_ICON_OPTIONS: {
  value: SocialIconName;
  label: string;
}[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "telegram", label: "Telegram" },
  { value: "message", label: "Chat / WhatsApp" },
  { value: "website", label: "Website" },
  { value: "music", label: "TikTok / Music" },
  { value: "camera", label: "Camera" },
  { value: "video", label: "Video" },
];

const SOCIAL_ICON_COMPONENTS: Record<SocialIconName, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  telegram: Send,
  message: MessageCircle,
  website: Globe,
  music: Music,
  camera: Camera,
  video: Video,
};

export interface SocialSetting {
  key: string;
  value: unknown;
}

function safeUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function readLegacyLinks(settings: SocialSetting[]): SocialLink[] {
  const legacyDefinitions: {
    key: string;
    id: string;
    name: string;
    icon: SocialIconName;
    fallback?: string;
  }[] = [
    {
      key: "social.facebook",
      id: "default-facebook",
      name: "Facebook",
      icon: "facebook",
      fallback: DEFAULT_SOCIAL_LINKS[0].url,
    },
    {
      key: "social.twitter",
      id: "default-twitter",
      name: "X (Twitter)",
      icon: "twitter",
      fallback: DEFAULT_SOCIAL_LINKS[1].url,
    },
    {
      key: "social.instagram",
      id: "default-instagram",
      name: "Instagram",
      icon: "instagram",
      fallback: DEFAULT_SOCIAL_LINKS[2].url,
    },
    {
      key: "social.youtube",
      id: "default-youtube",
      name: "YouTube",
      icon: "youtube",
    },
  ];

  return legacyDefinitions.flatMap((definition) => {
    const configuredValue = settings.find(
      (setting) => setting.key === definition.key,
    )?.value;
    const url = safeUrl(configuredValue)
      ? configuredValue
      : definition.fallback;
    return url
      ? [
          {
            id: definition.id,
            name: definition.name,
            url,
            icon: definition.icon,
          },
        ]
      : [];
  });
}

export function getSocialLinksFromSettings(
  settings?: SocialSetting[] | null,
): SocialLink[] {
  const list = settings ?? [];
  const setting = list.find((item) => item.key === "social.links");
  if (!setting) return readLegacyLinks(list);

  let value = setting.value;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const parsed = socialLinksSettingSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function getSocialIcon(icon: SocialIconName): LucideIcon {
  return SOCIAL_ICON_COMPONENTS[icon];
}

export function createSocialLinkId(): string {
  return globalThis.crypto?.randomUUID?.() ??
    `social-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
