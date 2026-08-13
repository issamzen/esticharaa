// Merge this pattern into your existing root route/layout.

import { Outlet, createRootRoute } from "@tanstack/react-router";
import { LocaleBoundary } from "@/components/site/locale-boundary";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <LocaleBoundary>
      <Outlet />
    </LocaleBoundary>
  );
}
