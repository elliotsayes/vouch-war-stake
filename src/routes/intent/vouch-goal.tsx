import { createFileRoute } from "@tanstack/react-router";

type VouchGoalSearch = {
  value: number;
  currency: string;
  profileId?: string;
};

export const Route = createFileRoute("/intent/vouch-goal")({
  validateSearch: (search): VouchGoalSearch => {
    return {
      value: Number(search.value),
      currency: (search.currency as string) || "USD",
      profileId: (search.profileId as string) || undefined,
    };
  },

  component: VouchGoal,
});

function VouchGoal() {
  const {
    currency: targetCurrency,
    value: targetValue,
    profileId,
  } = Route.useSearch();

  return (
    <div className="p-2">
      <h1>Vouch Goal</h1>
      <p>
        Target Value: {targetValue} {targetCurrency}
      </p>
      <p>Profile ID: {profileId}</p>
    </div>
  );
}
