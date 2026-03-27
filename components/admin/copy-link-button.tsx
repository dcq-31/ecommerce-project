"use client";

import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
      <span className="flex-1 truncate font-mono text-sm text-neutral-600 dark:text-neutral-300">
        {url}
      </span>
      <button
        onClick={handleCopy}
        title={copied ? "Copiado" : "Copiar enlace"}
        className="flex shrink-0 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-neutral-300 transition hover:bg-neutral-50 dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-emerald-500" />
        ) : (
          <ClipboardIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-300" />
        )}
      </button>
    </div>
  );
}