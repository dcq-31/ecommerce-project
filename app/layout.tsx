import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "components/theme-provider";
import { CartProvider } from "components/cart/cart-context";
import { CurrencyProvider } from "components/currency-context";
import CartModal from "components/cart/modal";
import { Navbar } from "components/layout/navbar";
import { getCurrencies } from "lib/products";
import { getSettings } from "lib/admin/settings-actions";
import { GeistSans } from "geist/font/sans";
import { baseUrl } from "lib/utils";
import "./globals.css";

const { SITE_NAME } = process.env;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME ?? "Tienda",
    template: `%s | ${SITE_NAME ?? "Tienda"}`,
  },
  description: "Descubre nuestros productos y realiza tu pedido fácilmente.",
  robots: { follow: true, index: true },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [currencies, settings] = await Promise.all([getCurrencies(), getSettings()]);

  return (
    <html lang="es" className={GeistSans.variable} suppressHydrationWarning>
      <body className="flex min-h-svh flex-col bg-neutral-50 text-black dark:bg-neutral-900 dark:text-white antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider currencies={currencies}>
            <CartProvider>
              <Navbar />
              <main className="flex-1">
                {children}
                <Toaster richColors closeButton />
              </main>
              <CartModal phoneNumber={settings.phone_number} />
            </CartProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
