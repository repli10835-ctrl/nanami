import { useEffect, useState } from "react";
import logo from "@/assets/nanami-logo.png";
import heroImg from "@/assets/hero.jpg";

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      onClick={() => setLeaving(true)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-[oklch(0.16_0.01_60)] transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-16 text-center">
        <img
          src={logo}
          alt="Nanami Kitchen logo"
          width={816}
          height={816}
          className="h-28 w-28 animate-in fade-in zoom-in-95 duration-700"
        />
        <h1 className="mt-4 font-display text-5xl italic tracking-tight text-[oklch(0.82_0.12_85)]">
          nanami
        </h1>
        <p className="mt-1 text-xl font-medium uppercase tracking-[0.45em] text-[oklch(0.82_0.12_85)]">
          kitchen
        </p>
        <p className="mt-8 text-base leading-relaxed text-[oklch(0.92_0.01_80)]">
          Good Food.
          <br />
          Made with Love
        </p>
      </div>

      <div className="relative h-[42vh] w-full">
        <img
          src={heroImg}
          alt="Signature bowl from Nanami Kitchen"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.01_60)] via-transparent to-transparent" />
      </div>
    </div>
  );
}
