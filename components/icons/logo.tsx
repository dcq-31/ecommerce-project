import clsx from "clsx";
import Image from "next/image";

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="logo"
      width={20}
      height={20}
      className={clsx("h-5 w-5", className)}
    />
  );
}
