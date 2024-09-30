import { DepositParameters } from "@/contract/custody";
import { AoSigner } from "@/hooks/useAoSigner";
import { useMachine } from "@xstate/react";
import { custodyDepositMachine } from "@/machines/custodyDeposit";
import { Button } from "../ui/button";

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

  return (
    <div>
      {state.matches({ Depositing: "Showing Confirmation" }) && (
        <div>
          <Button onClick={() => send({ type: "Cancel Deposit" })}>
            Cancel
          </Button>
          <Button onClick={() => send({ type: "Confirm Deposit" })}>
            Confirm
          </Button>
        </div>
      )}
      <pre>{JSON.stringify(state.value)}</pre>
    </div>
  );
};
