import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      <Link
        to="/intent/vouch-goal"
        search={{
          targetValue: 10,
          targetCurrency: "USD",
          profileId: "QIi6XZQOJlCnT_Vf-xKdcYqrBk-Y94QT8eiuBDLsMq8",
        }}
      >
        Vouch Goal
      </Link>
    </div>
  );
}
