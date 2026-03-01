"use client";

import clsx from "clsx";
import { useCurrency } from "./currency-context";

const Price = ({
  amount,
  className,
  currencyCode,
  currencyCodeClassName,
  ...props
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => {
  const { currency, rate } = useCurrency();
  const converted = parseFloat(amount) * rate;
  const formatted = converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <p suppressHydrationWarning={true} className={className} {...props}>
      $ {formatted}
      <span className={clsx("ml-1 inline", currencyCodeClassName)}>
        {currency || currencyCode}
      </span>
    </p>
  );
};

export default Price;
