import { createFileRoute } from "@tanstack/react-router";
import { VouchValue } from "@/contract/vouchDao";
import { VouchProgress } from "@/components/screens/VouchProgress";
import { ConnectWalletBlocker } from "@/components/screens/ConnectWalletBlocker";
import { DepositParameters } from "@/contract/custody";
import { useEffect, useRef, useState } from "react";
import { StakeProgress } from "@/components/screens/StakeProgress";
import { toast } from "sonner";
import { useActiveAddress } from "arweave-wallet-kit";

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

  const [depositParameters, setDepositParameters] =
    useState<DepositParameters | null>(null);

  const address = useActiveAddress();
  const lastAddress = useRef(address);
  useEffect(() => {
    if (address !== lastAddress.current) {
      lastAddress.current = address;
      if (depositParameters) {
        toast("Wallet change detected", {
          description: "Please try completing the deposit process again.",
        });
        setDepositParameters(null);
      }
    }
  }, [address, depositParameters]);

  return depositParameters === null ? (
    <VouchProgress
      targetValue={targetValue}
      profileId={profileId}
      appLink={appLink}
      onConfirmDeposit={setDepositParameters}
    />
  ) : (
    <ConnectWalletBlocker>
      {(walletId, aoSigner) => (
        <StakeProgress
          walletId={walletId}
          aoSigner={aoSigner}
          depositParameters={depositParameters}
          onDepositCancelled={() => {
            toast("Deposit cancelled", {
              description:
                "Please try completing the deposit process again, so you can reach your vouch goal.",
            });
            setDepositParameters(null);
          }}
          onDepositComplete={() => {
            toast("Deposit complete!", {
              description:
                "You've successfully deposited your stake. Please check your vouch goal again!",
            });
            setDepositParameters(null);
          }}
        />
      )}
    </ConnectWalletBlocker>
  );
}
