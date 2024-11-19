import { createFileRoute } from "@tanstack/react-router";
import { VouchFlow } from "@/components/screens/VouchFlow";

export const Route = createFileRoute("/intent/vouch-status")({
  component: Vouch,
});

function Vouch() {
  return <VouchFlow />;
}
