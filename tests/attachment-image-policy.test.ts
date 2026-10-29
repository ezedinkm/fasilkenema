import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hasJpegOrPngSignature,
  isAllowedJpgPngAttachment,
} from "../shared/attachmentImagePolicy";

test("attachment policy allows JPG, JPEG, and PNG only", () => {
  assert.equal(
    isAllowedJpgPngAttachment({ name: "member.jpg", type: "image/jpeg" }),
    true,
  );
  assert.equal(
    isAllowedJpgPngAttachment({ name: "member.jpeg", type: "image/jpeg" }),
    true,
  );
  assert.equal(
    isAllowedJpgPngAttachment({ name: "member.png", type: "image/png" }),
    true,
  );
  assert.equal(
    isAllowedJpgPngAttachment({ name: "member.webp", type: "image/webp" }),
    false,
  );
  assert.equal(
    isAllowedJpgPngAttachment({ name: "member.jpg", type: "image/png" }),
    false,
  );
});

test("attachment policy verifies the actual JPEG and PNG file signatures", () => {
  assert.equal(
    hasJpegOrPngSignature(
      new Uint8Array([0xff, 0xd8, 0xff, 0x00]),
      "image/jpeg",
    ),
    true,
  );
  assert.equal(
    hasJpegOrPngSignature(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    hasJpegOrPngSignature(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/jpeg",
    ),
    false,
  );
});
