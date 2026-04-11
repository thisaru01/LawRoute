import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    id: "consultations",
    title: "Request consultations from lawyers",
    description:
      "Send a structured request, share key details, and receive responses from verified lawyers who understand your matter.",
    ctaLabel: "Request a consultation",
    href: "/find-a-lawyer",
  },
  {
    id: "cases",
    title: "Manage cases in one workspace",
    description:
      "Track case status, meetings, tasks, and supporting documents in a single timeline so both citizens and lawyers always know what needs to happen next.",
    ctaLabel: "See case workflows",
    href: "/citizen",
  },
  {
    id: "legal-library",
    title: "Explore the legal library",
    description:
      "Browse plain-language articles, case notes, and official documents written by legal professionals to better understand procedures, rights, and obligations in Sri Lankan law.",
    ctaLabel: "Browse legal content",
    href: "/legal-library/articles",
  },
  {
    id: "civil-issues",
    title: "Report and track civil issues",
    description:
      "Submit civil complaints with location details, attach evidence, and follow how authorities review, update, and resolve each issue over time.",
    ctaLabel: "View civil issues",
    href: "/civil-issues",
  },
  {
    id: "lawyer-profiles",
    title: "Discover verified lawyer profiles",
    description:
      "Filter by practice area, language, location, and experience, and review public activity so you can select a lawyer who fits your case and communication style.",
    ctaLabel: "Find a lawyer",
    href: "/find-a-lawyer",
  },
];

export default function Features() {
  const [firstFeature, ...otherFeatures] = FEATURES;

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
      <div className="relative mx-auto w-full max-w-6xl px-4">
        {/* First viewport: section header + first feature */}
        <div className="flex min-h-screen flex-col justify-between gap-10 py-14 sm:py-16 lg:py-20">
          {/* Section header */}
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Features
            </p>
            <h2 className="text-[2.3rem] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[2.6rem] lg:text-[2.9rem]">
              One platform for the full legal journey
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              LawRoute combines consultations, case management, knowledge
              resources, and civil-issue handling into a single, secure system
              for citizens, lawyers, and authorities.
            </p>
          </div>

          {/* First feature row inside same viewport */}
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Text column */}
            <div className="order-1">
              <h3 className="text-2xl font-semibold text-[#0F172A] sm:text-[1.7rem]">
                {firstFeature.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {firstFeature.description}
              </p>

              <div className="mt-7">
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#121212] px-8 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to={firstFeature.href}>{firstFeature.ctaLabel}</Link>
                </Button>
              </div>
            </div>

            {/* Image placeholder column */}
            <div className="order-2">
              <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/80 shadow-sm aspect-[4/3]">
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500">
                  Feature preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining features - slightly shorter than full viewport */}
        <div className="space-y-0">
          {otherFeatures.map((feature, index) => {
            const realIndex = index + 1; // keep alternating pattern
            const imageOnRight = realIndex % 2 === 0; // first feature had image right

            const textColClasses = imageOnRight
              ? "order-1 lg:order-1"
              : "order-1 lg:order-2";

            const imageColClasses = imageOnRight
              ? "order-2 lg:order-2"
              : "order-2 lg:order-1";

            return (
              <div
                key={feature.id}
                className="grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20"
              >
                {/* Text column */}
                <div className={textColClasses}>
                  <h3 className="text-2xl font-semibold text-[#0F172A] sm:text-[1.7rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                    {feature.description}
                  </p>

                  <div className="mt-7">
                    <Button
                      asChild
                      className="h-12 rounded-full bg-[#121212] px-8 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Link to={feature.href}>{feature.ctaLabel}</Link>
                    </Button>
                  </div>
                </div>

                {/* Image placeholder column */}
                <div className={imageColClasses}>
                  <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/80 shadow-sm aspect-[4/3]">
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500">
                      Feature preview
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
