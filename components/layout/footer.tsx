const { COMPANY_NAME, SITE_NAME } = process.env;

export default function Footer() {
  const siteName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="relative border-t border-neutral-400 bg-white dark:border-neutral-600 dark:bg-neutral-950">
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1.5 px-4 py-8 min-[1320px]:px-0">
        {siteName && (
          <p className="bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-sm font-semibold tracking-widest uppercase text-transparent dark:from-neutral-100 dark:to-neutral-500">
            {siteName}
          </p>
        )}
        <p className="text-[11px] tracking-wide text-neutral-600 dark:text-neutral-500">
          Hecho con ❤️
        </p>
      </div>
    </footer>
  );
}
