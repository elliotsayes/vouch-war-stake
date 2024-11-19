import { createFileRoute } from "@tanstack/react-router";
import { VouchValue } from "@/contract/vouchDao";
import { VouchFlow } from "@/components/screens/VouchFlow";

export type VouchGoalSearch = {
  value: number;
  currency: string;
  profileId?: string;
  appLink?: string;
};

export const Route = createFileRoute("/intent/vouch-goal")({
  validateSearch: (search): VouchGoalSearch => {
    return {
      value: Number(search.value),
      currency: (search.currency as string) || "USD",
      profileId: (search.profileId as string) || undefined,
      appLink: (search.appLink as string) || undefined,
    };
  },

  component: VouchGoal,
});

function VouchGoal() {
  const { currency, value, profileId, appLink } = Route.useSearch();
  const targetValue: VouchValue = {
    value,
    currency,
  };

  return (
    <VouchFlow
      targetValue={targetValue}
      profileId={profileId}
      appLink={appLink}
    />
  );
}
