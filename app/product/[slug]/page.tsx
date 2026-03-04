import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Gallery } from "components/product/gallery";
import { ProductDescription } from "components/product/product-description";
import Footer from "components/layout/footer";
import { getProduct, getProducts } from "lib/products";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) return notFound();

  const { url, altText } = product.featuredImage ?? { url: "", altText: "" };

  return {
    title: product.title,
    openGraph: url
      ? {
          images: [{ url, width: 800, height: 800, alt: altText }],
        }
      : undefined,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) return notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.featuredImage?.url,
    offers: {
      "@type": "Offer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.price.currencyCode,
      price: product.price.amount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-neutral-400 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-500 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          {/* Gallery */}
          <div className="w-full lg:w-1/2">
            <Suspense
              fallback={
                <div className="aspect-square w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              }
            >
              <Gallery
                images={product.images.map((img) => ({
                  src: img.url,
                  altText: img.altText,
                }))}
              />
            </Suspense>
          </div>

          {/* Product info — sticky on desktop */}
          <div className="w-full lg:sticky lg:top-28 lg:w-1/2 lg:self-start">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  const products = await getProducts({});
  return products.map((p) => ({ slug: p.slug }));
}
