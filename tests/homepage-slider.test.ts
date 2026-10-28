import assert from "node:assert/strict";
import { test } from "node:test";
import { homepageSliderSettingSchema } from "../shared/homepageSlider";

const validSlide = {
  id: "slide-1",
  title: "Fasil Kenema",
  description: "A club story",
  imageUrl: "/api/media/hero.jpg",
  priority: 1,
  durationSeconds: 6,
  enabled: true,
};

test("homepage slider accepts image, text, order, and display time settings", () => {
  const result = homepageSliderSettingSchema.safeParse([
    validSlide,
    { ...validSlide, id: "slide-2", priority: 2, durationSeconds: 12 },
  ]);

  assert.equal(result.success, true);
});

test("homepage slider rejects invalid timing and a fully disabled slider", () => {
  assert.equal(
    homepageSliderSettingSchema.safeParse([
      { ...validSlide, durationSeconds: 0 },
    ]).success,
    false,
  );
  assert.equal(
    homepageSliderSettingSchema.safeParse([
      { ...validSlide, enabled: false },
    ]).success,
    false,
  );
});
