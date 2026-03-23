export default function Navbar() {
  const links = [
    { label: "Home", href: "#" },
    { label: "Find a Lawyer", href: "#" },
    { label: "Articles", href: "#" },
    { label: "Consultations", href: "#" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <a href="#" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
            LR
          </span>
          <span>LawRoute</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign in
          </a>
          <a
            href="#"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
