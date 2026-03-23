import Navbar from "@/components/Navbar.jsx";
import Home from "@/public/Home.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <Home />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}
