import { DepositParameters } from "@/contract/custody";
import { AoSigner } from "@/hooks/useAoSigner";
import { useMachine } from "@xstate/react";
import { custodyDepositMachine } from "@/machines/custodyDeposit";
import { Button } from "../ui/button";
import { useEffect } from "react";
import TextTransition, { presets } from "react-text-transition";

interface StakeProgressProps {
  walletId: string;
  aoSigner: AoSigner;
  depositParameters: DepositParameters;
  onDepositCancelled: () => void;
  onDepositComplete: () => void;
}

export const StakeProgress = ({
  walletId,
  aoSigner,
  depositParameters,
  onDepositCancelled,
  onDepositComplete,
}: StakeProgressProps) => {
  const quantityWhole = parseInt(depositParameters.quantity) / 10 ** 12;
  const stakeDurationDays =
    depositParameters.stakeDurationMs / (24 * 60 * 60 * 1000);

  const [state, send] = useMachine(custodyDepositMachine, {
    input: {
      context: {
        walletId,
        aoSigner,
        depositParameters,
      },
    },
  });

  const isCancelledState =
    state.matches("SetupError") || state.matches("User Cancelled");
  const isDoneState = state.matches({ Depositing: "Done" });

  useEffect(() => {
    if (isCancelledState) {
      onDepositCancelled();
    } else if (isDoneState) {
      onDepositComplete();
    }
  }, [isCancelledState, isDoneState, onDepositCancelled, onDepositComplete]);

  const isSingleState = typeof state.value === "string";
  const primaryState = (
    isSingleState ? state.value : Object.keys(state.value)[0]
  ) as string;
  const isDoubleState =
    !isSingleState && typeof Object.values(state.value)[0] === "string";
  const secondaryState = isSingleState
    ? undefined
    : isDoubleState
      ? Object.values(state.value)[0]
      : Object.keys(Object.values(state.value)[0])[0];

  const isConfirmation = state.matches({ Depositing: "Showing Confirmation" });

  return (
    <div className="flex flex-col h-screen relative items-center justify-center">
      <div className="text-center">
        <div
          className={`flex flex-col items-center gap-2 min-h-8 transition-all duration-500 ${isConfirmation ? "h-32" : "h-24"}`}
        >
          <TextTransition springConfig={presets.wobbly} className="text-2xl">
            {isConfirmation ? "Proceed with Deposit?" : primaryState}
          </TextTransition>
          {isConfirmation ? (
            <>
              <p>
                This will lock {quantityWhole.toFixed(4)} $wAR for{" "}
                {stakeDurationDays.toFixed(1)} days
                <br />
                in your personal secure{" "}
                <a
                  href={`https://ao.link/#/entity/${state.context.custodyProcessId}`}
                  className="underline text-blue-800"
                  target="_blank"
                >
                  custody contract
                </a>
                .
              </p>
              <div className="flex flex-row justify-center gap-2">
                <Button
                  variant={"secondary"}
                  onClick={() => send({ type: "Cancel Deposit" })}
                >
                  Cancel
                </Button>
                <Button
                  variant={"default"}
                  onClick={() => send({ type: "Confirm Deposit" })}
                >
                  Confirm
                </Button>
              </div>
            </>
          ) : (
            <>
              <TextTransition className="text-muted-foreground">
                {secondaryState}
              </TextTransition>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
