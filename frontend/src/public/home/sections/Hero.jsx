import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ladyJustice from "@/assets/lady-justice.webp";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: Image placeholder ── */}
          <div className="relative order-2 lg:order-1">
            {/* Main image placeholder */}
            <div className="relative w-full max-w-md mx-auto lg:mx-0 overflow-hidden">
              <img
                src={ladyJustice}
                alt="Lady Justice"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* ── Right: Content ── */}
          <div className="order-1 flex flex-col gap-6 lg:order-2 lg:gap-8">
            {/* Title & tagline */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] ">
                Modern legal guidance
              </p>
              <h1 className="text-[2.75rem] font-bold leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
                Navigate Sri Lankan law with confidence
              </h1>
            </div>

            {/* Description */}
            <p className="max-w-xl text-lg leading-relaxed">
              LawRoute connects citizens, lawyers, and authorities in one
              trusted digital space. Find the right legal help, understand your
              options, and move your case forward with clarity and transparency.
            </p>

            {/* CTA */}
            <div className="flex flex-row items-center gap-4 mt-2">
              <Button
                asChild
                className="h-14 rounded-full bg-[#121212] px-10 text-base font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/find-a-lawyer">Find a lawyer</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-14 rounded-full bg-slate-50 px-10 text-base font-semibold border border-black transition-all  hover:border-b-gray-900"
              >
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
