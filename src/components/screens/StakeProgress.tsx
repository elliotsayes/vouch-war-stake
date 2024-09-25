import { DepositParameters } from "@/contract/custody";
import useAoSigner, { AoSigner } from "@/hooks/useAoSigner";
import { useActiveAddress } from "arweave-wallet-kit";
import { useMachine } from "@xstate/react";
import { custodyDepositMachine } from "@/machines/custodyDeposit";

interface StakeProgressProps {
  walletId: string;
  aoSigner: AoSigner;
  depositParameters: DepositParameters;
}

export const StakeProgress = ({
  walletId,
  aoSigner,
  depositParameters,
}: StakeProgressProps) => {
  const [state, send] = useMachine(custodyDepositMachine, {
    input: {
      walletId,
      aoSigner,
      depositParameters,
    },
  });

  return <div>{JSON.stringify(state.value)}</div>;
};
