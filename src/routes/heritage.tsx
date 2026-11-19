import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/heritage")({
  component: HeritageLayout,
});

function HeritageLayout() {
  return <Outlet />;
}
