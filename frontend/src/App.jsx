import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import PublicLayout from "@/public/PublicLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
