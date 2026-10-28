import { z } from "zod";

export const homepageSlideSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(600),
  imageUrl: z.string().trim().min(1).max(2048),
  priority: z.number().int().min(1).max(9999),
  durationSeconds: z.number().int().min(1).max(120),
  enabled: z.boolean(),
});

export const homepageSliderSettingSchema = z
  .array(homepageSlideSchema)
  .min(1)
  .max(20)
  .refine((slides) => slides.some((slide) => slide.enabled), {
    message: "Enable at least one homepage slide.",
  });

export type HomepageSlide = z.infer<typeof homepageSlideSchema>;
