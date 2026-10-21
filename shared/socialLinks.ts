import { z } from "zod";

export const SOCIAL_ICON_NAMES = [
  "facebook",
  "instagram",
  "youtube",
  "twitter",
  "linkedin",
  "telegram",
  "message",
  "website",
  "music",
  "camera",
  "video",
] as const;

export const socialLinkSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(60),
  url: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "Use an http or https URL"),
  icon: z.enum(SOCIAL_ICON_NAMES),
});

export const socialLinksSettingSchema = z
  .array(socialLinkSchema)
  .max(30)
  .superRefine((links, context) => {
    const ids = new Set<string>();
    links.forEach((link, index) => {
      if (ids.has(link.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "id"],
          message: "Social link IDs must be unique",
        });
      }
      ids.add(link.id);
    });
  });

export type SocialLink = z.infer<typeof socialLinkSchema>;
export type SocialIconName = (typeof SOCIAL_ICON_NAMES)[number];
