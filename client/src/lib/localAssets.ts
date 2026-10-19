const assetUrls = import.meta.glob<string>("../assets/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

export function getLocalAssetUrl(path: string): string | undefined {
  return assetUrls[`../assets/${path}`];
}
