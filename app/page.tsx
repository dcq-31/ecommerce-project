import type { Metadata } from "next";
import { BannerCarousel } from "components/banner-carousel";
import { CategoryProductsSection } from "components/home/category-products-section";
import Footer from "components/layout/footer";
import { getProducts, getBanners, getCategories } from "lib/products";

export const metadata: Metadata = {
  description: "Descubre nuestros productos y realiza tu pedido fácilmente.",
  openGraph: { type: "website" },
};

export default async function HomePage() {
  const [banners, categories, allProducts] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts(),
  ]);

  // Only show categories that have at least one product
  const categoriesWithProductTitles = new Set(
    allProducts.map((p) => p.category).filter(Boolean),
  );
  const activeCategories = categories.filter((cat) =>
    categoriesWithProductTitles.has(cat.title),
  );

  const firstCategory = activeCategories[0]?.title;
  const initialProducts = firstCategory
    ? allProducts.filter((p) => p.category === firstCategory)
    : [];

  return (
    <>
      <BannerCarousel banners={banners} />
      {activeCategories.length > 0 && (
        <CategoryProductsSection
          categories={activeCategories}
          initialProducts={initialProducts}
          initialCategory={firstCategory!}
        />
      )}
      <Footer />
    </>
  );
}
