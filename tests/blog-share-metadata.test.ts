import assert from "node:assert/strict";
import test from "node:test";
import { renderBlogShareMetadata } from "../server/blogShareMetadata";

test("article share metadata uses its dedicated preview image and absolute URLs", () => {
  const metadata = renderBlogShareMetadata(
    {
      slug: "cup-final",
      titleEn: "Cup Final & Celebration",
      contentEn: "The club lifted the trophy.\nA second paragraph.",
      shareImageUrl: "/uploads/posts/share-card.jpg",
      imageUrl: "/uploads/posts/article-cover.jpg",
    },
    "https://club.example",
  );

  assert.match(metadata, /property="og:title" content="Cup Final &amp; Celebration"/);
  assert.match(metadata, /property="og:type" content="article"/);
  assert.match(
    metadata,
    /property="og:image" content="https:\/\/club\.example\/uploads\/posts\/share-card\.jpg"/,
  );
  assert.match(
    metadata,
    /property="og:url" content="https:\/\/club\.example\/blog\/cup-final"/,
  );
  assert.match(metadata, /name="twitter:card" content="summary_large_image"/);
  assert.match(metadata, /The club lifted the trophy\. A second paragraph\./);
});

test("article share metadata falls back to the post image", () => {
  const metadata = renderBlogShareMetadata(
    {
      slug: "match-day",
      titleEn: "Match day",
      contentEn: "Kickoff at 4 PM.",
      shareImageUrl: null,
      imageUrl: "https://images.example/match.jpg",
    },
    "https://club.example",
  );

  assert.match(
    metadata,
    /property="og:image" content="https:\/\/images\.example\/match\.jpg"/,
  );
});

test("non-article routes retain the club-wide social preview", () => {
  const metadata = renderBlogShareMetadata(null, "https://club.example");

  assert.match(metadata, /property="og:type" content="website"/);
  assert.match(
    metadata,
    /property="og:image" content="https:\/\/club\.example\/fasillogo\.png"/,
  );
});
