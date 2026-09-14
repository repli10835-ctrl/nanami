import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import defaultHeroImg from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export function PromoCarousel() {
  const { promos, cms } = useStore((s) => ({
    promos: s.promos,
    cms: s.cms,
  }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % promos.length), 4500);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (promos.length === 0) return null;
  const promo = promos[Math.min(index, promos.length - 1)];
  if (!promo) return null;

  const bgImage = promo.imageUrl || cms?.heroImage || defaultHeroImg;
  const ctaText = cms?.heroCtaText || "Order Now";

  return (
    <section className="mt-2">
      <div className="relative overflow-hidden rounded-xl border border-border/60">
        <img
          src={bgImage}
          alt="Nanami Kitchen signature dish"
          width={1024}
          height={640}
          className="h-32 sm:h-36 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex w-2/3 flex-col justify-center gap-0.5 pl-3 pr-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            {promo.badge}
          </p>
          <p className="text-base sm:text-lg font-black leading-tight text-primary line-clamp-1">
            {promo.title}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{promo.subtitle}</p>
          <Link
            to="/menu"
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground transition hover:brightness-105"
          >
            {ctaText} <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
      <div className="mt-1.5 flex justify-center gap-1">
        {promos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            aria-label={`Show promo ${i + 1}`}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-4 bg-primary" : "w-1 bg-muted"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
