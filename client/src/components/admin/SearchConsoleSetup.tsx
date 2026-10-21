import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  CircleDot,
  Copy,
  ExternalLink,
  FileCode2,
  Globe2,
  Search,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const siteOrigin = "https://fasilkenemasc.et";
const sitemapUrl = `${siteOrigin}/sitemap.xml`;
const robotsUrl = `${siteOrigin}/robots.txt`;
const searchConsoleUrl = "https://search.google.com/search-console";

export default function SearchConsoleSetup() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function copySitemapUrl() {
    try {
      await navigator.clipboard.writeText(sitemapUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-[#e5e2d9] bg-[#fffefa] shadow-[0_8px_24px_-18px_rgba(31,43,31,0.35)]">
      <CardHeader className="relative overflow-hidden border-b border-[#e8e5dd] bg-[#f7f6f0] px-5 py-5 sm:px-7 sm:py-6">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-[#e9e6dd] bg-[linear-gradient(135deg,transparent_48%,rgba(34,74,50,0.035)_49%,rgba(34,74,50,0.035)_51%,transparent_52%)] bg-[length:18px_18px] md:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a40e08] text-white shadow-sm">
              <Search aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#687264]">
                Club website · visibility setup
              </p>
              <CardTitle className="text-xl font-bold tracking-tight text-[#20291f] sm:text-2xl">
                Google Search Console
              </CardTitle>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#62685f]">
                A short guide for verifying Fasil Kenema S.C.’s official website
                and helping Google find its public pages.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#d8dfd2] bg-[#edf2e9] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#36583d]">
            <CircleDot aria-hidden="true" className="h-3 w-3" />
            Guidance only
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <section aria-labelledby="verify-domain-title" className="rounded-xl border border-[#e5e2d9] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a40e08] text-sm font-bold tabular-nums text-white">01</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b9186]">First · ownership</p>
                <h3 id="verify-domain-title" className="mt-1 font-semibold text-[#20291f]">Verify the domain</h3>
                <p className="mt-2 text-sm leading-6 text-[#62685f]">
                  In Search Console, add a <strong className="font-semibold text-[#30392f]">Domain property</strong> for:
                </p>
                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-md border border-[#e8e5dd] bg-[#f7f6f0] px-3 py-2">
                  <Globe2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#496b4f]" />
                  <code className="break-all text-sm font-semibold text-[#30392f]">fasilkenemasc.et</code>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#62685f]">
                  Choose DNS TXT verification. Copy Google’s TXT record and add it
                  in the domain provider’s DNS settings, then return to Search
                  Console to verify. A Domain property covers subdomains and
                  both HTTP and HTTPS versions.
                </p>
                <Button asChild size="sm" className="mt-4 min-h-10 bg-[#a40e08] px-4 text-white hover:bg-[#850c07]">
                  <a href={searchConsoleUrl} target="_blank" rel="noopener noreferrer">
                    Open Google Search Console
                    <ArrowUpRight aria-hidden="true" className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </section>

          <div aria-hidden="true" className="hidden items-center justify-center px-1 lg:flex">
            <span className="h-px w-7 bg-[#dcded5]" />
            <span className="h-2 w-2 -ml-1 rounded-full bg-[#a40e08]" />
          </div>

          <section aria-labelledby="submit-sitemap-title" className="rounded-xl border border-[#e5e2d9] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#36583d] text-sm font-bold tabular-nums text-white">02</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b9186]">Next · discovery</p>
                <h3 id="submit-sitemap-title" className="mt-1 font-semibold text-[#20291f]">Submit the sitemap</h3>
                <p className="mt-2 text-sm leading-6 text-[#62685f]">
                  Once the domain is verified, open the Sitemaps report in Google
                  Search Console and submit this address:
                </p>
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[#e8e5dd] bg-[#f7f6f0] p-3 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 break-all text-xs leading-5 text-[#3c443b] sm:text-sm">
                    {sitemapUrl}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySitemapUrl}
                    className="min-h-10 shrink-0 border-[#d8d9d1] bg-white text-[#30392f] hover:bg-[#f2f2ec]"
                    aria-label={copyState === "copied" ? "Sitemap URL copied" : "Copy sitemap URL"}
                  >
                    {copyState === "copied" ? (
                      <Check aria-hidden="true" className="h-4 w-4 text-[#36583d]" />
                    ) : (
                      <Copy aria-hidden="true" className="h-4 w-4" />
                    )}
                    {copyState === "copied" ? "Copied" : "Copy URL"}
                  </Button>
                </div>
                <p aria-live="polite" className={`mt-2 min-h-5 text-xs ${copyState === "error" ? "text-[#a40e08]" : "text-[#496b4f]"}`}>
                  {copyState === "copied" && "Sitemap address copied to clipboard."}
                  {copyState === "error" && "Could not copy automatically. Select and copy the address above."}
                </p>
                <a
                  href={sitemapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-[#9b0f06] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a40e08] focus-visible:ring-offset-2"
                >
                  Preview sitemap <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3 rounded-xl border border-[#dfe6da] bg-[#f2f5ee] p-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#496b4f]" />
            <div>
              <p className="text-sm font-semibold text-[#30392f]">Allow time for Google to process the sitemap</p>
              <p className="mt-1 text-sm leading-5 text-[#62685f]">
                The sitemap includes public pages and published news. Google data
                can take several days to appear after submission.
              </p>
            </div>
          </div>
          <a
            href={robotsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-4 text-sm font-semibold text-[#36583d] transition-colors hover:bg-[#f6f8f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496b4f] focus-visible:ring-offset-2 sm:justify-start"
          >
            <FileCode2 aria-hidden="true" className="h-4 w-4" />
            View robots.txt
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex items-start gap-2.5 border-t border-[#ece9e1] pt-4">
          <Timer aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#81877d]" />
          <p className="text-xs leading-5 text-[#70766c]">
            This panel is a setup guide only. It does not connect a Google
            account or import Search Console reports.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
