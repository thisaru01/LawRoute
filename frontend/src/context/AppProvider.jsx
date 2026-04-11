import { AuthProvider } from "@/context/auth/AuthProvider";

export default function AppProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
