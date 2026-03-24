import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import PublicLayout from "@/public/PublicLayout.jsx";
import AuthPage from "@/public/AuthPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
