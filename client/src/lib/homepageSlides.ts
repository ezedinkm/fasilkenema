import type { HomepageSlide } from "@shared/homepageSlider";
import { homepageSliderSettingSchema } from "@shared/homepageSlider";
import cityRunImage from "@/assets/banner/city-run.webp";
import paradeImage from "@/assets/banner/gondar-parade.webp";
import stadiumImage from "@/assets/banner/stadium-support.webp";
import fanRunImage from "@/assets/banner/fan-run.webp";
import teamCastleImage from "@/assets/banner/team-castle.webp";
import teamArchiveImage from "@/assets/banner/team-archive-2009.webp";

export const DEFAULT_HOMEPAGE_SLIDES: HomepageSlide[] = [
  {
    id: "default-city-run",
    imageUrl: cityRunImage,
    title: "We Are FASIL S.C",
    description:
      "Join the official FASIL S.C fan community and be part of Ethiopian football excellence.",
    priority: 1,
    durationSeconds: 6,
    enabled: true,
  },
  {
    id: "default-gondar-parade",
    imageUrl: paradeImage,
    title: "Welcome To Our Home",
    description:
      "Experience the passion and excitement of Ethiopian football at its finest.",
    priority: 2,
    durationSeconds: 6,
    enabled: true,
  },
  {
    id: "default-stadium",
    imageUrl: stadiumImage,
    title: "We Are FASIL S.C",
    description:
      "Join the official FASIL S.C fan community and be part of Ethiopian football excellence.",
    priority: 3,
    durationSeconds: 6,
    enabled: true,
  },
  {
    id: "default-fan-run",
    imageUrl: fanRunImage,
    title: "Welcome To Our Home",
    description:
      "Experience the passion and excitement of Ethiopian football at its finest.",
    priority: 4,
    durationSeconds: 6,
    enabled: true,
  },
  {
    id: "default-team-castle",
    imageUrl: teamCastleImage,
    title: "We Are FASIL S.C",
    description:
      "Join the official FASIL S.C fan community and be part of Ethiopian football excellence.",
    priority: 5,
    durationSeconds: 6,
    enabled: true,
  },
  {
    id: "default-team-archive",
    imageUrl: teamArchiveImage,
    title: "Welcome To Our Home",
    description:
      "Experience the passion and excitement of Ethiopian football at its finest.",
    priority: 6,
    durationSeconds: 6,
    enabled: true,
  },
];

export function getHomepageSlidesFromSettings(
  settings: unknown,
): HomepageSlide[] {
  if (!Array.isArray(settings)) return DEFAULT_HOMEPAGE_SLIDES;

  const sliderSetting = settings.find(
    (setting) =>
      setting &&
      typeof setting === "object" &&
      "key" in setting &&
      setting.key === "home.slider",
  ) as { value?: unknown } | undefined;
  const parsed = homepageSliderSettingSchema.safeParse(sliderSetting?.value);
  if (!parsed.success) return DEFAULT_HOMEPAGE_SLIDES;

  const enabledSlides = parsed.data
    .filter((slide) => slide.enabled)
    .sort((a, b) => a.priority - b.priority);
  return enabledSlides.length > 0 ? enabledSlides : DEFAULT_HOMEPAGE_SLIDES;
}
