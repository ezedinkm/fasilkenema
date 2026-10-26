import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseManagedPageContent,
  serializeManagedPageContent,
  type ManagedPageDraft,
} from "../shared/managedPageContent";

const fallback: ManagedPageDraft = {
  intro: "Original intro",
  sections: [
    {
      heading: "Original section",
      text: "Original story",
      imageUrl: "/media/old.jpg",
      imageAlt: "Historic team",
    },
  ],
};

test("managed page content round-trips multiple text and image sections", () => {
  const draft: ManagedPageDraft = {
    intro: "New intro",
    sections: [
      {
        heading: "Founding",
        text: "The first chapter",
        imageUrl: "/api/media/managed-one.jpg",
        imageAlt: "Founding team",
      },
      {
        heading: "Champions",
        text: "A later milestone",
        imageUrl: "/api/media/managed-two.png",
        imageAlt: "Trophy celebration",
      },
    ],
  };

  assert.deepEqual(
    parseManagedPageContent(serializeManagedPageContent(draft), fallback),
    draft,
  );
});

test("legacy or invalid managed content uses an independent fallback copy", () => {
  const legacy = parseManagedPageContent("plain page content", fallback);
  assert.deepEqual(legacy, fallback);
  legacy.sections[0].heading = "Changed";
  assert.equal(fallback.sections[0].heading, "Original section");

  const malformed = parseManagedPageContent(
    "FASIL_MANAGED_PAGE_SECTIONS_V1\n{broken json",
    fallback,
  );
  assert.deepEqual(malformed, fallback);
});
