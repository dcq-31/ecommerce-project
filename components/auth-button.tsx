import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { UserIcon } from "@heroicons/react/24/outline";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-neutral-600 sm:inline dark:text-neutral-400">
        Hola, {user.email?.split("@")[0]}!
      </span>
      <LogoutButton />
    </div>
  ) : (
    <Link
      href="/auth/login"
      aria-label="Iniciar sesión"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-400 text-neutral-600 transition-colors hover:border-primary hover:text-primary dark:border-neutral-500 dark:text-neutral-400"
    >
      <UserIcon className="h-5 w-5" />
    </Link>
  );
}
