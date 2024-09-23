import { createLazyFileRoute } from "@tanstack/react-router";
import { Home } from "../Home";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return <Home />;
}
