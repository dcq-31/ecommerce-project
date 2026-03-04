"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Price from "components/price";
import { useCurrency } from "components/currency-context";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  fmtMoney,
  generateOrderId,
  type OrderData,
} from "lib/order";
import { createOrder } from "lib/admin/order-actions";

/** Routes where the floating cart trigger should not appear. */
const HIDDEN_PATHS = ["/admin", "/auth"];

export default function CartModal({ phoneNumber }: { phoneNumber?: string }) {
  const cart = useCart();
  const { currency, rate } = useCurrency();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const openCart = () => setIsOpen(true);
  const closeCart = () => {
    setIsOpen(false);
    setCheckoutDone(false);
  };

  const showButton = !HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  function handleCheckout() {
    const order: OrderData = {
      id: generateOrderId(),
      ts: Date.now(),
      cur: currency,
      rate,
      items: cart.items.map((item) => ({
        id: item.productId,
        slug: item.slug,
        t: item.title,
        bp: item.price.amount,
        qty: item.quantity,
      })),
    };

    const message = buildWhatsAppMessage(order);
    window.open(buildWhatsAppUrl(phoneNumber!, message), "_blank");
    setCheckoutDone(true);

    // Persist order to DB in the background — non-blocking
    void createOrder(order);
  }

  const convertedTotal = parseFloat(cart.totalAmount.amount) * rate;
  const hasPhone = Boolean(phoneNumber?.trim());

  return (
    <>
      {showButton && (
        <button
          aria-label="Abrir cesta"
          onClick={openCart}
          className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-110 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 active:scale-95"
        >
          {cart.totalQuantity > 0 && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/25" />
          )}
          <ShoppingBagIcon className="h-8 w-8" />
          {cart.totalQuantity > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-primary shadow">
              {cart.totalQuantity > 99 ? "99+" : cart.totalQuantity}
            </span>
          )}
        </button>
      )}

      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
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

          <TransitionChild
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-300 bg-white/90 p-6 backdrop-blur-xl md:w-[420px] dark:border-neutral-700 dark:bg-neutral-950/90">
              {/* ── Header ──────────────────────────────────────────────── */}
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Mi cesta
                </p>
                <button
                  aria-label="Cerrar cesta"
                  onClick={closeCart}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-400 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-500 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* ── Empty state ─────────────────────────────────────────── */}
              {cart.items.length === 0 && !checkoutDone && (
                <div className="mt-20 flex w-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <ShoppingBagIcon className="h-10 w-10 text-neutral-400" />
                  </div>
                  <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Tu cesta está vacía.
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Agrega productos para comenzar.
                  </p>
                </div>
              )}

              {/* ── Checkout success state ──────────────────────────────── */}
              {checkoutDone && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">¡Casi listo!</p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Se abrió WhatsApp con tu pedido. Para completar la compra,
                      envía el mensaje al administrador y él procesará tu
                      pedido.
                    </p>
                  </div>
                  <div className="mt-4 flex w-full flex-col gap-2">
                    <button
                      onClick={() => {
                        cart.clearCart();
                        closeCart();
                      }}
                      className="w-full rounded-full bg-primary p-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Vaciar cesta y cerrar
                    </button>
                    <button
                      onClick={closeCart}
                      className="w-full rounded-full border border-neutral-400 p-3 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-800"
                    >
                      Mantener cesta
                    </button>
                  </div>
                </div>
              )}

              {/* ── Cart items ──────────────────────────────────────────── */}
              {cart.items.length > 0 && !checkoutDone && (
                <div className="flex h-full flex-col justify-between overflow-hidden pt-4">
                  <ul className="grow overflow-auto">
                    {cart.items
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((item) => (
                        <li
                          key={item.productId}
                          className="border-b border-neutral-400 py-4 dark:border-neutral-600"
                        >
                          <div className="flex gap-3">
                            {/* Image */}
                            <div className="relative flex-none">
                              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-400 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900">
                                {item.image ? (
                                  <Image
                                    fill
                                    sizes="96px"
                                    alt={item.image.altText || item.title}
                                    src={item.image.url}
                                    className="object-contain p-1"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800" />
                                )}
                              </div>
                              <div className="absolute -right-2 -top-2 z-10">
                                <DeleteItemButton item={item} />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900 hover:text-primary dark:text-neutral-100 dark:hover:text-primary"
                              >
                                {item.title}
                              </Link>
                              <Price
                                className="text-sm font-semibold text-primary"
                                amount={String(
                                  (
                                    parseFloat(item.price.amount) *
                                    item.quantity
                                  ).toFixed(2),
                                )}
                                currencyCode={item.price.currencyCode}
                              />
                              <div className="flex h-8 items-center self-start rounded-full border border-neutral-400 dark:border-neutral-500">
                                <EditItemQuantityButton
                                  item={item}
                                  type="minus"
                                />
                                <span className="w-6 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <EditItemQuantityButton
                                  item={item}
                                  type="plus"
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>

                  {/* ── Summary & checkout ─────────────────────────────── */}
                  <div className="pt-4">
                    <div className="mb-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                          Envío
                        </p>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                          Calculado al confirmar
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-neutral-400 pt-2 dark:border-neutral-600">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Total
                        </p>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                          $ {fmtMoney(convertedTotal)}{" "}
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">
                            {currency}
                          </span>
                        </p>
                      </div>
                    </div>

                    {hasPhone ? (
                      <button
                        onClick={handleCheckout}
                        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] p-3.5 text-sm font-semibold text-white shadow-md shadow-[#25D366]/30 transition-all hover:bg-[#1ebe57] hover:shadow-lg hover:shadow-[#25D366]/40 active:scale-[0.98]"
                      >
                        <WhatsAppIcon className="h-5 w-5 flex-shrink-0" />
                        Confirmar pedido por WhatsApp
                      </button>
                    ) : (
                      <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                        El administrador aún no ha configurado un número de
                        contacto.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
