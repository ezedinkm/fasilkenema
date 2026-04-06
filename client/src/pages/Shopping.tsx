import React from "react";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, ShoppingBag } from "lucide-react";

const OFFICIAL_STORE_URL =
  "https://tinamart.com/products/20fad3e9-8997-43bc-a7ed-86cc852671c6";

interface ImageItem {
  id: number;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  title: string;
}

const Shopping: React.FC = () => {
  const images: ImageItem[] = [
    {
      id: 1,
      imageUrl:
        "https://tinamart.com/_next/image?url=https%3A%2F%2Fapi.tinamart.com%2Fstorage%2Fimages%2Fproducts%2F104-17612057004427.webp&w=640&q=75",
      linkUrl: OFFICIAL_STORE_URL,
      alt: "Fasil Kenema merchandise — product view 1",
      title: "Featured look 1",
    },
    {
      id: 2,
      imageUrl:
        "https://tinamart.com/_next/image?url=https%3A%2F%2Fapi.tinamart.com%2Fstorage%2Fimages%2Fproducts%2F104-17612052307661.webp&w=640&q=75",
      linkUrl: OFFICIAL_STORE_URL,
      alt: "Fasil Kenema merchandise — product view 2",
      title: "Featured look 2",
    },
    {
      id: 3,
      imageUrl:
        "https://tinamart.com/_next/image?url=https%3A%2F%2Fapi.tinamart.com%2Fstorage%2Fimages%2Fproducts%2F104-17612035417613.webp&w=640&q=75",
      linkUrl: OFFICIAL_STORE_URL,
      alt: "Fasil Kenema merchandise — product view 3",
      title: "Featured look 3",
    },
    {
      id: 4,
      imageUrl:
        "https://tinamart.com/_next/image?url=https%3A%2F%2Fapi.tinamart.com%2Fstorage%2Fimages%2Fproducts%2F104-17612035623963.webp&w=640&q=75",
      linkUrl: OFFICIAL_STORE_URL,
      alt: "Fasil Kenema merchandise — product view 4",
      title: "Featured look 4",
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 via-white to-gray-50/80">
        <section
          className="relative overflow-hidden border-b border-gray-100/80"
          aria-labelledby="shopping-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(220 38 38 / 0.12), transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16 md:px-8 md:pb-20 md:pt-20 lg:px-10 lg:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/90 px-3 py-1.5 text-red-800 shadow-sm backdrop-blur-sm sm:mb-8">
                <ShoppingBag
                  className="h-4 w-4 shrink-0 text-red-600"
                  aria-hidden
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                  Official merchandise
                </span>
              </div>
              <h1
                id="shopping-heading"
                className="font-heading text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              >
                Fasil Kenema
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-gray-600 sm:mt-5 sm:text-lg">
                Gear up with official club apparel. Browse the collection and
                open the store in a new tab to complete your purchase securely
                on our partner shop.
              </p>
              <div className="mx-auto mt-8 flex justify-center sm:mt-10">
                <Button
                  asChild
                  size="lg"
                  className="min-h-11 w-full max-w-sm sm:w-auto sm:max-w-none"
                >
                  <a
                    href={OFFICIAL_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    Shop official store
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16 lg:px-10 lg:py-20 xl:py-24"
          aria-label="Featured merchandise"
        >
          <div className="mb-10 flex flex-col gap-2 sm:mb-12 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                Featured picks
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                Tap a card to open the official product page. Images may load
                from the store CDN.
              </p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 md:text-right">
              {images.length} items
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-2 lg:gap-8 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
            {images.map((image) => (
              <li key={image.id} className="list-none">
                <a
                  href={image.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full rounded-2xl border border-gray-100/90 bg-white p-2 shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-100 hover:shadow-lg hover:ring-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  <div className="relative overflow-hidden rounded-xl bg-gray-100">
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="pointer-events-none absolute bottom-3 left-3 right-3 translate-y-1 rounded-lg bg-white/95 px-3 py-2 text-center text-xs font-semibold text-gray-900 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm">
                      Open in store
                      <ExternalLink
                        className="ml-1.5 inline-block h-3.5 w-3.5 align-text-bottom opacity-70"
                        aria-hidden
                      />
                    </span>
                  </div>
                  <div className="px-1 pb-1 pt-3 sm:px-2 sm:pt-4">
                    <p className="text-center text-sm font-semibold text-gray-800 transition-colors group-hover:text-red-700 sm:text-base">
                      {image.title}
                    </p>
                    <p className="mt-0.5 text-center text-xs text-gray-500">
                      Official FASIL S.C
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex justify-center sm:mt-14 md:mt-16">
            <Button asChild size="lg" className="min-h-12 px-8 sm:min-h-11">
              <a
                href={OFFICIAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Continue to full store
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Shopping;
