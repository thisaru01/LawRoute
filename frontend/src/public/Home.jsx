import Navbar from "@/components/Navbar.jsx";
import Hero from "@/public/home/sections/Hero.jsx";
import Features from "@/public/home/sections/Features.jsx";
import ContactSection from "@/public/home/sections/ContactSection.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <ContactSection />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}
