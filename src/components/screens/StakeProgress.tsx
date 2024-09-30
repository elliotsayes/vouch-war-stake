import { DepositParameters } from "@/contract/custody";
import { AoSigner } from "@/hooks/useAoSigner";
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
      context: {
        walletId,
        aoSigner,
        depositParameters,
      },
    },
  });

  return <div>{JSON.stringify(state.value)}</div>;
};
