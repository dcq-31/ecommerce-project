"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { useCurrency } from "./currency-context";

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  if (currencies.length === 0) return null;

  const selectedCurrency = currencies.find((c) => c.name === currency);

  return (
    <Listbox value={currency} onChange={setCurrency}>
      <div className="relative">
        <ListboxButton className="flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm text-neutral-600 transition-colors hover:border-primary focus:border-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-400">
          {selectedCurrency?.imageUrl && (
            <div className="relative h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={selectedCurrency.imageUrl}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}
          {currency}
          <ChevronUpDownIcon className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
        </ListboxButton>

        <ListboxOptions className="absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border border-neutral-300 bg-white py-1 shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-900">
          {currencies.map((cur) => (
            <ListboxOption
              key={cur.name}
              value={cur.name}
              className={({ focus }: { focus: boolean }) =>
                clsx(
                  "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm",
                  focus
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-neutral-900 dark:text-neutral-100",
                )
              }
            >
              {({ selected }: { selected: boolean }) => (
                <>
                  <CheckIcon
                    className={clsx(
                      "h-3.5 w-3.5 flex-shrink-0",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cur.imageUrl && (
                    <div className="relative h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={cur.imageUrl}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  {cur.name}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
