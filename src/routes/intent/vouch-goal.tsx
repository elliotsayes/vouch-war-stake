import { createFileRoute } from "@tanstack/react-router";
import { VouchValue } from "@/contract/vouchDao";
import { VouchProgress } from "@/components/screens/VouchProgress";
import { ConnectWalletBlocker } from "@/components/screens/ConnectWalletBlocker";
import { DepositParameters } from "@/contract/custody";
import { useState } from "react";
import { StakeProgress } from "@/components/screens/StakeProgress";

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

  const [depositParameters, setDepositParameters] =
    useState<DepositParameters | null>(null);

  const [depositResult, setDepositResult] = useState<true | null>(null);

  return (
    <ConnectWalletBlocker>
      {(walletId, aoSigner) =>
        depositParameters === null ? (
          <VouchProgress
            targetValue={targetValue}
            profileId={profileId}
            onConfirmDeposit={setDepositParameters}
          />
        ) : depositResult === null ? (
          <StakeProgress
            walletId={walletId}
            aoSigner={aoSigner}
            depositParameters={depositParameters}
          />
        ) : (
          <div>Done!</div>
        )
      }
    </ConnectWalletBlocker>
  );
}
