import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Truck } from "lucide-react";
import defaultHeroImg from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export function PromoCarousel() {
  const { promos, cms, settings } = useStore((s) => ({
    promos: s.promos.filter((p) => p.active !== false),
    cms: s.cms,
    settings: s.settings,
  }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % promos.length), 4500);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (cms?.heroActive === false) return null;
  if (promos.length === 0) {
    // Show fallback hero if no promos but hero is active
    const bgImage = cms?.heroImage || defaultHeroImg;
    const ctaText = cms?.heroCtaText || "Order Now";
    const symbol = settings?.currencySymbol || "N$";
    return (
      <section className="relative">
        <div className="relative overflow-hidden rounded-b-2xl border-b border-border/60 shadow-xs">
          <img
            src={bgImage}
            alt="Nanami Kitchen signature dish"
            width={1024}
            height={640}
            className="h-44 sm:h-48 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex w-3/4 sm:w-2/3 flex-col justify-center gap-1 pl-4 pr-2">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground tracking-tight">
              Nanami Kitchen signature dish
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/30">
                <Truck className="size-3" />
                Delivery
              </span>
            </div>
            <p className="text-base sm:text-lg font-black leading-tight text-foreground">
              Free delivery over {symbol} 250
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-2">
              Within 5 km radius of our kitchen
            </p>
            <Link
              to="/menu"
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:brightness-105 active:scale-95"
            >
              {ctaText} <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }
  const promo = promos[Math.min(index, promos.length - 1)];
  if (!promo) return null;

  const bgImage = promo.imageUrl || cms?.heroImage || defaultHeroImg;
  const ctaText = cms?.heroCtaText || "Order Now";
  const symbol = settings?.currencySymbol || "N$";
  const title = promo.title.replace(/\b(R|N\$)\s*(\d+)/g, `${symbol} $2`);
  const subtitle = promo.subtitle.replace(/\b(R|N\$)\s*(\d+)/g, `${symbol} $2`);

  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-b-2xl border-b border-border/60 shadow-xs">
        <img
          src={bgImage}
          alt="Nanami Kitchen signature dish"
          width={1024}
          height={640}
          className="h-44 sm:h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex w-3/4 sm:w-2/3 flex-col justify-center gap-1 pl-4 pr-2">
          <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground tracking-tight">
            Nanami Kitchen signature dish
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/30">
              <Truck className="size-3" />
              {promo.badge}
            </span>
          </div>
          <p className="text-base sm:text-lg font-black leading-tight text-foreground">{title}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-2">
            {subtitle}
          </p>
          <Link
            to="/menu"
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:brightness-105 active:scale-95"
          >
            {ctaText} <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
      {promos.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {promos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIndex(i)}
              aria-label={`Show promo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
