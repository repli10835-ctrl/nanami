import { createFileRoute, redirect } from "@tanstack/react-router";

// Halaman auth lama digantikan oleh /login dan /register.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
