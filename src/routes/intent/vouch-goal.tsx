import { createFileRoute } from "@tanstack/react-router";
import { VouchValue } from "@/contract/vouchDao";
import { VouchProgress } from "@/components/screens/VouchProgress";
import { ConnectWalletBlocker } from "@/components/screens/ConnectWalletBlocker";

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
  const { currency, value, profileId } = Route.useSearch();
  const targetValue: VouchValue = {
    value,
    currency,
  };

  return (
    <ConnectWalletBlocker>
      <VouchProgress targetValue={targetValue} profileId={profileId} />
    </ConnectWalletBlocker>
  );
}
