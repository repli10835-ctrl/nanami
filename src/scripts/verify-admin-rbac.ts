// Evaluator that mirrors AuthGuard.tsx exact logic
function isOperationalAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/orders" ||
    pathname.startsWith("/admin/orders/") ||
    pathname === "/admin/stock" ||
    pathname.startsWith("/admin/stock/")
  );
}

function isOwnerOnlyAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/menu" ||
    pathname.startsWith("/admin/menu/") ||
    pathname === "/admin/media" ||
    pathname.startsWith("/admin/media/") ||
    pathname === "/admin/customers" ||
    pathname.startsWith("/admin/customers/") ||
    pathname === "/admin/reports" ||
    pathname.startsWith("/admin/reports/") ||
    pathname === "/admin/settings" ||
    pathname.startsWith("/admin/settings/")
  );
}

function evaluateAuthGuard(
  pathname: string,
  userRole: "user" | "staff" | "admin" | "owner",
  signedIn: boolean,
) {
  const isOwnerArea = pathname === "/owner" || pathname.startsWith("/owner/");
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  // 1. Owner pages check: strictly role "owner" only
  if (isOwnerArea) {
    if (!signedIn) {
      return { status: "REDIRECT", destination: `/login?redirect=${pathname}` };
    }
    if (userRole !== "owner") {
      return { status: "DENIED", destination: "/admin" };
    }
    return { status: "ALLOWED", destination: pathname };
  }

  // 2. Admin / Kitchen pages check: staff, admin, and owner
  if (isAdminArea) {
    if (!signedIn) {
      return { status: "REDIRECT", destination: `/login?redirect=${pathname}` };
    }
    if (userRole === "user") {
      return { status: "DENIED", destination: "/" };
    }

    // Owner-only admin paths (Menu CRUD, Media, Customers, Reports, Settings)
    if (isOwnerOnlyAdminPath(pathname)) {
      if (userRole !== "owner") {
        return { status: "DENIED", destination: "/admin" };
      } else {
        return { status: "ALLOWED_OR_REDIRECTED_TO_OWNER", destination: pathname };
      }
    }

    // Role staff & admin restricted to operational tools
    if ((userRole === "staff" || userRole === "admin") && !isOperationalAdminPath(pathname)) {
      return { status: "DENIED", destination: "/admin" };
    }

    return { status: "ALLOWED", destination: pathname };
  }

  return { status: "ALLOWED", destination: pathname };
}

console.log("=========================================================================");
console.log("TEST 1: ROLE 'admin' MENCOBA AKSES SELURUH RUTE /owner/* (HARUS DENIED)");
console.log("=========================================================================\n");

const ownerRoutes = [
  "/owner",
  "/owner/orders",
  "/owner/finance",
  "/owner/menu",
  "/owner/media",
  "/owner/cms",
  "/owner/preview",
  "/owner/vouchers",
  "/owner/customers",
  "/owner/staff",
  "/owner/outlets",
  "/owner/shipping",
  "/owner/settings",
  "/owner/audit",
];

const adminOwnerTestResults = ownerRoutes.map((route) => {
  const evaluation = evaluateAuthGuard(route, "admin", true);
  return {
    Path: route,
    Access: evaluation.status,
    RedirectTo: evaluation.destination,
    Passed: evaluation.status === "DENIED" && evaluation.destination === "/admin",
  };
});

console.table(adminOwnerTestResults);
const allOwnerDenied = adminOwnerTestResults.every((r) => r.Passed);
console.assert(allOwnerDenied, "Seluruh rute owner harus ditolak untuk admin!");

console.log("\n=========================================================================");
console.log("TEST 2: ROLE 'admin' MENCOBA AKSES MENU OWNER-LEVEL DI /admin/* (HARUS DENIED)");
console.log("=========================================================================\n");

const sensitiveAdminRoutes = [
  "/admin/menu",
  "/admin/media",
  "/admin/customers",
  "/admin/reports",
  "/admin/settings",
];

const adminSensitiveTestResults = sensitiveAdminRoutes.map((route) => {
  const evaluation = evaluateAuthGuard(route, "admin", true);
  return {
    Path: route,
    Access: evaluation.status,
    RedirectTo: evaluation.destination,
    Passed: evaluation.status === "DENIED" && evaluation.destination === "/admin",
  };
});

console.table(adminSensitiveTestResults);
const allSensitiveDenied = adminSensitiveTestResults.every((r) => r.Passed);
console.assert(allSensitiveDenied, "Menu level owner di admin harus ditolak untuk admin!");

console.log("\n=========================================================================");
console.log("TEST 3: ROLE 'admin' MENGAKSES RUTE OPERASIONAL SAH (HARUS ALLOWED)");
console.log("=========================================================================\n");

const operationalRoutes = ["/admin", "/admin/orders", "/admin/stock"];

const adminOperationalResults = operationalRoutes.map((route) => {
  const evaluation = evaluateAuthGuard(route, "admin", true);
  return {
    Path: route,
    Access: evaluation.status,
    RedirectTo: evaluation.destination,
    Passed: evaluation.status === "ALLOWED",
  };
});

console.table(adminOperationalResults);
const allOperationalAllowed = adminOperationalResults.every((r) => r.Passed);
console.assert(allOperationalAllowed, "Rute operasional sah harus diizinkan untuk admin!");

console.log("\n=========================================================================");
console.log("TEST 4: ROLE 'owner' MENGAKSES SELURUH RUTE OWNER & OPERASIONAL (HARUS ALLOWED)");
console.log("=========================================================================\n");

const ownerAllAllowed = [...ownerRoutes, ...operationalRoutes].every((route) => {
  const evaluation = evaluateAuthGuard(route, "owner", true);
  return evaluation.status === "ALLOWED" || evaluation.status === "ALLOWED_OR_REDIRECTED_TO_OWNER";
});

console.log(`Owner Full Access Verified: ${ownerAllAllowed ? "PASSED (100% OK)" : "FAILED"}`);
console.assert(ownerAllAllowed, "Owner harus memiliki akses ke seluruh rute!");
