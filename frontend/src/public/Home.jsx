import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
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
      <Footer />
    </div>
  );
}
