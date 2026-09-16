import { AuthGuard } from "../components/AuthGuard";

// Evaluator that mirrors AuthGuard.tsx exact logic
function evaluateAuthGuard(
  pathname: string,
  userRole: "user" | "staff" | "admin" | "owner",
  signedIn: boolean,
) {
  const isOwnerArea = pathname === "/owner" || pathname.startsWith("/owner/");
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isStaffAllowedAdminPath =
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/orders" ||
    pathname.startsWith("/admin/orders/") ||
    pathname === "/admin/stock" ||
    pathname.startsWith("/admin/stock/");

  // 1. Owner pages check: strictly role "owner" only
  if (isOwnerArea) {
    if (!signedIn) {
      return { status: "REDIRECT", destination: `/login?redirect=${pathname}` };
    }
    if (userRole !== "owner") {
      return { status: "REDIRECT", destination: "/admin" };
    }
    return { status: "ALLOWED", destination: pathname };
  }

  // 2. Admin / Kitchen pages check: staff, admin, and owner
  if (isAdminArea) {
    if (!signedIn) {
      return { status: "REDIRECT", destination: `/login?redirect=${pathname}` };
    }
    if (userRole === "user") {
      return { status: "REDIRECT", destination: "/" };
    }
    if (userRole === "staff" && !isStaffAllowedAdminPath) {
      return { status: "REDIRECT", destination: "/admin" };
    }
    return { status: "ALLOWED", destination: pathname };
  }

  return { status: "ALLOWED", destination: pathname };
}

console.log("=========================================================================");
console.log("EVALUASI RBAC: ROLE 'admin' MENCOBA AKSES SELURUH RUTE /owner/*");
console.log("=========================================================================\n");

const ownerRoutes = [
  "/owner",
  "/owner/finance",
  "/owner/menu",
  "/owner/cms",
  "/owner/preview",
  "/owner/vouchers",
  "/owner/staff",
  "/owner/outlets",
  "/owner/shipping",
  "/owner/settings",
  "/owner/audit",
];

const adminTestResults = ownerRoutes.map((route) => {
  const evaluation = evaluateAuthGuard(route, "admin", true);
  return {
    Path: route,
    Access: evaluation.status,
    RedirectTo: evaluation.destination,
    Passed: evaluation.status === "REDIRECT" && evaluation.destination === "/admin",
  };
});

console.table(adminTestResults);

console.log("\n=========================================================================");
console.log("EVALUASI RBAC: ROLE 'admin' MENGAKSES RUTE /admin/* (Kewenangan Sah Admin)");
console.log("=========================================================================\n");

const adminRoutes = [
  "/admin",
  "/admin/orders",
  "/admin/menu",
  "/admin/stock",
  "/admin/customers",
  "/admin/reports",
  "/admin/settings",
];

const adminValidResults = adminRoutes.map((route) => {
  const evaluation = evaluateAuthGuard(route, "admin", true);
  return {
    Path: route,
    Access: evaluation.status,
    RedirectTo: evaluation.destination,
    Passed: evaluation.status === "ALLOWED",
  };
});

console.table(adminValidResults);
