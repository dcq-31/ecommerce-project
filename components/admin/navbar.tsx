"use client";

import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import {
  BanknotesIcon,
  Bars3Icon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  FolderIcon,
  HomeIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import LogoSquare from "components/logo-square";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio", Icon: HomeIcon, exact: true },
  { href: "/admin", label: "Resumen", Icon: ChartBarIcon, exact: true },
  { href: "/admin/products", label: "Productos", Icon: CubeIcon, exact: false },
  { href: "/admin/categories", label: "Categorías", Icon: FolderIcon, exact: false },
  { href: "/admin/orders", label: "Pedidos", Icon: ClipboardDocumentListIcon, exact: false },
  { href: "/admin/banners", label: "Anuncios", Icon: PhotoIcon, exact: false },
  { href: "/admin/currencies", label: "Monedas", Icon: BanknotesIcon, exact: false },
  { href: "/admin/settings", label: "Configuración", Icon: Cog6ToothIcon, exact: false },
];

export function AdminSidebar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Trigger button — rendered inline inside the Navbar */}
      <button
        aria-label="Abrir menú de administración"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-400 text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-500 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Slide-in drawer — same pattern as CartModal */}
      <Transition show={isOpen}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* Backdrop */}
          <TransitionChild
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>

          {/* Panel */}
          <TransitionChild
            enter="transition-all ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="fixed bottom-0 left-0 top-0 flex h-full w-72 flex-col border-r border-neutral-300 bg-white/90 p-6 backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-950/90">
              {/* Header */}
              <div className="flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2.5">
                  <LogoSquare />
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Admin
                  </span>
                </Link>
                <button
                  aria-label="Cerrar menú"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-400 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-500 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label, Icon, exact }) => {
                  const active = exact
                    ? pathname === href
                    : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
