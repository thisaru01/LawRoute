import { Button } from "@/components/ui/button";
import ladyJustice from "@/assets/lady-justice.webp";

export default function ContactSection() {
  return (
    <section className="relative border-t border-slate-200 bg-white">
      {/* Subtle background pattern to match hero */}
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

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_minmax(0,1fr)] lg:gap-16">
          {/* Left: text */}
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Contact us
            </p>
            <h2 className="text-[2.3rem] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[2.6rem] lg:text-[2.9rem]">
              Let&apos;s talk about your legal needs
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg max-w-xl">
              Share a few details and our team will help you find the right
              starting point on LawRoute whether that&apos;s booking a
              consultation, submitting a civil issue, or exploring our legal
              library.
            </p>

            <div className="mt-6 grid gap-4 text-sm text-slate-700 sm:text-base">
              <div>
                <p className="font-medium text-[#0F172A]">Email</p>
                <p className="text-slate-600">lawroutesl@gmail.com</p>
              </div>
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                <div>
                  <p className="font-medium text-[#0F172A]">Support hours</p>
                  <p className="text-slate-600">
                    Monday to Friday, 9.00am – 5.00pm
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button className="h-12 rounded-full bg-[#121212] px-8 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                Send us an email
              </Button>
              <p className="text-xs text-slate-500 sm:text-sm">
                For urgent matters, please contact your lawyer or local
                authorities directly.
              </p>
            </div>
          </div>

          {/* Right: illustration image */}
          <div className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden">
              <img
                src={ladyJustice}
                alt="Illustration representing legal support"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
