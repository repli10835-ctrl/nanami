import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export function PromoCarousel() {
  const promos = useStore((s) => s.promos);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % promos.length), 4500);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (promos.length === 0) return null;
  const promo = promos[Math.min(index, promos.length - 1)];
  if (!promo) return null;

  return (
    <section className="mt-4">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={heroImg}
          alt="Nanami Kitchen signature dish"
          width={1024}
          height={640}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center gap-1 pl-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">{promo.badge}</p>
          <p className="text-2xl font-extrabold leading-tight text-primary">{promo.title}</p>
          <p className="text-sm text-muted-foreground">{promo.subtitle}</p>
          <Link
            to="/menu"
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Order Now <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {promos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            aria-label={`Show promo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
