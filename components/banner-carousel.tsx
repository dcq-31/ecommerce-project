"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Banner } from "lib/types";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_PLAY_MS = 4500;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = banners.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [next, paused, count]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0]!.clientX - touchStartX.current;
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
    touchStartX.current = null;
  }

  if (count === 0) return null;

  return (
    <section
      className="relative w-full select-none overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Carrusel de portada"
    >
      {/* Slides track */}
      <div
        className="flex transition-transform duration-500 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <article
            key={banner.id}
            className="relative min-w-full"
            aria-hidden={i !== current || undefined}
          >
            <div className="relative h-72 w-full sm:h-96 md:h-[32rem]">
              <Image
                src={banner.imageUrl}
                alt=""
                fill
                className="object-cover"
                priority={i === 0}
                draggable={false}
                sizes="100vw"
              />
            </div>
          </article>
        ))}
      </div>

      {/* Progress bar */}
      {count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            key={`${current}-${paused}`}
            className="h-full bg-white/40"
            style={{
              animation: paused
                ? "none"
                : `slideProgress ${AUTO_PLAY_MS}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Prev / Next arrows — only when more than one slide */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Diapositiva anterior"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 md:left-6"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente diapositiva"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 md:right-6"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === current}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-7 bg-white"
                  : "w-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {count > 1 && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          {current + 1} / {count}
        </span>
      )}
    </section>
  );
}
