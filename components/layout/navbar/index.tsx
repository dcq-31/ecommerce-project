import { AdminSidebar } from "components/admin/navbar";
import LogoSquare from "components/logo-square";
import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { CurrencySelector } from "@/components/currency-selector";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-300 bg-white/80 p-4 backdrop-blur-md lg:px-6 dark:border-neutral-700 dark:bg-neutral-900/80">
      <div className="flex w-full items-center">
        <div className="flex flex-1 items-center gap-3">
          <AdminSidebar isAuthenticated={isAuthenticated} />
          <Link href="/" prefetch={true} className="flex flex-shrink-0 items-center">
            <LogoSquare />
          </Link>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <CurrencySelector />
          <Suspense fallback={null}>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
