import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ladyJustice from "@/assets/lady-justice1.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Subtle dark gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/80" />

      <div className="relative mx-auto max-w-6xl min-h-[520px] px-4">
        <div className="grid h-full gap-10 lg:grid-cols-2">
          {/* Left: Text content */}
          <div className="flex items-center py-16 sm:py-20 lg:py-24">
            <div className="max-w-xl space-y-6 text-left text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80">
                Modern legal guidance
              </p>

              <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Navigate Sri Lankan law with confidence
              </h1>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-100/80">
                LawRoute connects citizens, lawyers, and authorities in one trusted digital space.
                Find the right legal help, understand your options, and move your case forward with
                clarity and transparency.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="h-12 rounded-full bg-amber-300 px-8 text-sm font-semibold text-black shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to="/find-a-lawyer">Find a lawyer</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border border-white/60 bg-transparent px-8 text-sm font-semibold text-white/90 backdrop-blur-sm hover:bg-white/10"
                >
                  <Link to="/auth">Get started</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Full-height image, no vertical gap */}
          <div className="relative h-full">
            <img
              src={ladyJustice}
              alt="Lady Justice statue"
              className="absolute inset-0 h-full w-full object-cover object-center drop-shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
