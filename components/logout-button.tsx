"use client";

import { createClient } from "@/lib/supabase/client";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      aria-label="Cerrar sesión"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition-colors hover:border-destructive hover:text-destructive dark:border-neutral-600 dark:text-neutral-400"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
    </button>
  );
}
