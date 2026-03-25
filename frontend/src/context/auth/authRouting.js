export function getDashboardPathForRole(role) {
  switch (role) {
    case "user":
      return "/citizen";
    case "lawyer":
      return "/lawyer";
    case "authority":
      return "/authority";
    case "admin":
      return "/admin";
    default:
      return "/auth";
  }
}
