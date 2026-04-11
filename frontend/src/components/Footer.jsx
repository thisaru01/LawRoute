import { Link } from "react-router-dom";

const NAV_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Home", to: "/" },
      { label: "Find a lawyer", to: "/find-a-lawyer" },
      { label: "Legal library", to: "/legal-library/articles" },
      { label: "Civil issues", to: "/civil-issues" },
    ],
  },
  {
    title: "For citizens",
    links: [
      { label: "Track cases", to: "/citizen/cases" },
      { label: "Consultation requests", to: "/citizen/consultation-requests" },
      { label: "Your account", to: "/auth" },
    ],
  },
  {
    title: "For professionals",
    links: [
      { label: "For lawyers", to: "/lawyer" },
      { label: "For authorities", to: "/authority" },
      { label: "Publish articles", to: "/lawyer/articles" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "Contact", to: "/#contact" },
      { label: "Support", to: "/auth" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-black text-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12 lg:py-14">
        {/* Top: logo + navigation columns */}
        <div className="flex flex-col gap-10 border-b border-slate-800 pb-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="space-y-3 sm:max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-xs font-semibold tracking-[0.18em]">
                LR
              </div>
              <span className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-100">
                LawRoute
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
              A modern platform connecting citizens, lawyers, and authorities to
              manage legal issues with clarity and transparency.
            </p>
          </div>

          {/* Navigation columns */}
          <div className="grid flex-1 gap-8 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="text-sm text-slate-200/80 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: description + contact */}
        <div className="mt-6 flex flex-col gap-6 text-xs text-slate-500 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:text-[0.8rem]">
          <p className="max-w-xl leading-relaxed">
            LawRoute is not a law firm and does not provide legal advice. It is
            a digital platform that helps you connect with qualified
            professionals and follow the progress of your matters.
          </p>

          <div className="space-y-2 text-right sm:text-left">
            <p className="text-slate-300">support@lawroute.lk</p>
            <p>© {year} LawRoute. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
