import { createFileRoute, redirect } from "@tanstack/react-router";

// No landing page: the first screen is the app itself. Send everyone to the
// dashboard, which lives under the authenticated layout and redirects to
// /auth when there is no session.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
