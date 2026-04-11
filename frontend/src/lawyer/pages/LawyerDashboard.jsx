import { useEffect } from "react";

export default function LawyerDashboard() {
  useEffect(() => {
    const headerName = document.querySelector("header .text-sm.font-medium");
    if (!headerName) return undefined;

    const previousDisplay = headerName.style.display;
    headerName.style.display = "none";

    return () => {
      headerName.style.display = previousDisplay;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to the lawyer area.
      </p>
    </div>
  );
}
