import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Admin
import AdminRouteLayout from "./admin/AdminRouteLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminProfile from "./admin/pages/AdminProfile.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";
import AdminCases from "./admin/pages/AdminCases.jsx";
import AdminCivilIssues from "./admin/pages/AdminCivilIssues.jsx";
import AdminArticles from "./admin/pages/AdminArticles.jsx";
import AdminDocuments from "./admin/pages/AdminDocuments.jsx";

// Citizen
import CitizenRouteLayout from "./citizen/CitizenRouteLayout.jsx";
import CitizenDashboard from "./citizen/pages/CitizenDashboard.jsx";
import CitizenConsultationRequests from "./citizen/pages/CitizenConsultationRequests.jsx";
import CitizenCases from "./citizen/pages/CitizenCases.jsx";
import CitizenCivilIssues from "./citizen/pages/CitizenCivilIssues.jsx";
import CitizenProfile from "./citizen/pages/CitizenProfile.jsx";

// Lawyer
import LawyerRouteLayout from "./lawyer/LawyerRouteLayout.jsx";
import LawyerDashboard from "./lawyer/pages/LawyerDashboard.jsx";
import LawyerProfile from "./lawyer/pages/LawyerProfile.jsx";
import LawyerConsultationRequests from "./lawyer/pages/LawyerConsultationRequests.jsx";
import LawyerCases from "./lawyer/pages/LawyerCases.jsx";

// Authority
import AuthorityRouteLayout from "./authority/AuthorityRouteLayout.jsx";
import AuthorityDashboard from "./authority/pages/AuthorityDashboard.jsx";
import AuthorityProfile from "./authority/pages/AuthorityProfile.jsx";
import AuthorityCivilIssues from "./authority/pages/AuthorityCivilIssues.jsx";

// Public
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

        <Route path="/lawyer" element={<LawyerRouteLayout />}>
          <Route index element={<LawyerDashboard />} />
          <Route path="profile" element={<LawyerProfile />} />
          <Route path="consultation-requests">
            <Route index element={<Navigate to="pending" replace />} />
            <Route path=":status" element={<LawyerConsultationRequests />} />
          </Route>
          <Route path="cases">
            <Route index element={<Navigate to="opened" replace />} />
            <Route path=":status" element={<LawyerCases />} />
          </Route>
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/authority" element={<AuthorityRouteLayout />}>
          <Route index element={<AuthorityDashboard />} />
          <Route path="profile" element={<AuthorityProfile />} />
          <Route path="civil-issues">
            <Route index element={<Navigate to="pending" replace />} />
            <Route path=":status" element={<AuthorityCivilIssues />} />
          </Route>
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/admin" element={<AdminRouteLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="cases">
            <Route index element={<Navigate to="open" replace />} />
            <Route path=":status" element={<AdminCases />} />
          </Route>
          <Route path="civil-issues">
            <Route index element={<Navigate to="pending" replace />} />
            <Route path=":status" element={<AdminCivilIssues />} />
          </Route>
          <Route path="articles">
            <Route index element={<Navigate to="pending" replace />} />
            <Route path=":status" element={<AdminArticles />} />
          </Route>
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
