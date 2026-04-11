import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ladyJustice from "@/assets/lady-justice3.jpg";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Full-width background image with dark overlay, like reference */}
      <div className="absolute inset-0">
        <img
          src={ladyJustice}
          alt="Lady Justice"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/70 to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative mx-auto flex min-h-130 max-w-6xl items-center px-4 py-16 sm:py-20 lg:py-24">
        <div className="max-w-xl space-y-6 text-left text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#faad38]">
            Modern legal guidance
          </p>

          <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Navigate Sri Lankan law with confidence
          </h1>

          <p className="max-w-xl mt-4 text-base sm:text-lg leading-relaxed text-slate-100/80">
            LawRoute connects citizens, lawyers, and authorities in one trusted
            digital space. Find the right legal help, understand your options,
            and move your case forward with clarity and transparency.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Link
              to="/find-a-lawyer#lawyer-search"
              className="inline-flex h-12 items-center justify-center rounded-full border border-transparent bg-[#faad38] px-8 text-sm font-semibold text-black shadow-sm transition-colors hover:border-white/60 hover:bg-transparent hover:text-white/90"
            >
              Find a lawyer
            </Link>

            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 bg-transparent px-8 text-sm font-semibold text-white/90 shadow-sm transition-colors hover:border-transparent hover:bg-[#faad38] hover:text-black"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
