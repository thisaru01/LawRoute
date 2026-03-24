import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import CitizenRouteLayout from "./citizen/CitizenRouteLayout.jsx";
import CitizenDashboard from "./citizen/pages/CitizenDashboard.jsx";
import CitizenConsultationRequests from "./citizen/pages/CitizenConsultationRequests.jsx";
import CitizenCases from "./citizen/pages/CitizenCases.jsx";
import CitizenCivilIssues from "./citizen/pages/CitizenCivilIssues.jsx";
import CitizenProfile from "./citizen/pages/CitizenProfile.jsx";
import PublicLayout from "@/public/PublicLayout.jsx";
import AuthPage from "@/public/AuthPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/citizen" element={<CitizenRouteLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="profile" element={<CitizenProfile />} />
          <Route path="consultation-requests">
            <Route index element={<Navigate to="pending" replace />} />
            <Route path=":status" element={<CitizenConsultationRequests />} />
          </Route>
          <Route path="cases">
            <Route index element={<Navigate to="opened" replace />} />
            <Route path=":status" element={<CitizenCases />} />
          </Route>
          <Route path="civil-issues" element={<CitizenCivilIssues />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
