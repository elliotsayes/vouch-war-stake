import { GoalProgress } from "../GoalProgress";
import { VouchValue } from "@/contract/vouchDao";
import {
  ConnectButton,
  useActiveAddress,
  useConnection,
} from "arweave-wallet-kit";
import { VouchButtons } from "../VouchButtons";
import { useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StakeConfiguration } from "../StakeConfiguration";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { DepositParameters } from "@/contract/custody";
import { ConnectWalletBlocker } from "./ConnectWalletBlocker";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "../ui/button";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "../ui/tooltip";
import { ConnectWalletSuggestion } from "./ConnectWalletSuggestion";
import { AppTitle } from "../AppTitle";

export interface VouchProgressProps {
  targetValue?: VouchValue;
  profileId?: string;
  appLink?: string;
  onConfirmDeposit: (depositParameters: DepositParameters) => void;
}

export const VouchProgress = ({
  targetValue,
  profileId,
  appLink,
  onConfirmDeposit,
}: VouchProgressProps) => {
  const { connected, connect } = useConnection();

  const [showStakeSheet, setShowStakeSheet] = useState(false);
  const [showConfirmSubmitDialog, setShowConfirmSubmitDialog] = useState(false);

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  const [bonusValue, setBonusValue] = useState(0);

  const hasTarget = targetValue !== undefined;
  const currentMeetsTarget =
    hasTarget && vouchData.data && vouchData.data?.score >= targetValue.value;

  const projectedValue = (vouchData.data?.score ?? 0) + bonusValue;
  const projectedMeetsTarget = hasTarget && projectedValue >= targetValue.value;

  const [depositParameters, setDepositParameters] =
    useState<DepositParameters | null>(null);
  const onSubmitDeposit = useCallback(
    (depositParameters: DepositParameters) => {
      setDepositParameters(depositParameters);
      if (!hasTarget || projectedMeetsTarget) {
        onConfirmDeposit(depositParameters);
      } else {
        setShowConfirmSubmitDialog(true);
      }
    },
    [hasTarget, onConfirmDeposit, projectedMeetsTarget],
  );

  return (
    <TooltipProvider>
      <Sheet open={showStakeSheet} onOpenChange={setShowStakeSheet}>
        <AlertDialog
          open={showConfirmSubmitDialog}
          onOpenChange={setShowConfirmSubmitDialog}
        >
          <div className="flex flex-col h-screen relative">
            <div className="absolute top-0 left-0 p-2">
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                    })}
                    to={"/"}
                  >
                    <ArrowLeftIcon />
                  </Link>
                </TooltipTrigger>
                <TooltipContent align="start">Back to home</TooltipContent>
              </Tooltip>
            </div>
            <div className="absolute top-0 right-0 p-2">
              <ConnectButton />
            </div>
            {/* Centered box */}
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <AppTitle />
              <div className="py-4">
                <ConnectWalletSuggestion>
                  <GoalProgress
                    targetValue={targetValue}
                    currentMeetsTarget={currentMeetsTarget}
                    {...(showStakeSheet
                      ? {
                          bonusValue,
                          projectedMeetsTarget,
                        }
                      : {})}
                    profileId={profileId}
                    appLink={appLink}
                  />
                </ConnectWalletSuggestion>
              </div>
              <div
                className={`transition-opacity duration-500 ${showStakeSheet ? "opacity-50" : ""}`}
              >
                <h1 className="text-lg mb-4 text-muted-foreground">
                  Increase your vouch score with these services
                </h1>
                <VouchButtons
                  onActionVoucherClick={() => {
                    if (connected) {
                      setShowStakeSheet(true);
                    } else {
                      connect();
                    }
                  }}
                />
              </div>
              <div
                className={`transition-all duration-500 ${showStakeSheet ? "h-1/4" : "h-0"}`}
              />
            </div>
          </div>
          <SheetContent side={"bottom"}>
            <SheetHeader className="md:w-[80%] max-w-md mx-auto">
              <SheetTitle className="text-center">
                Earn vouch points by staking wrapped Arweave
              </SheetTitle>
            </SheetHeader>
            <ConnectWalletBlocker>
              {() => (
                <StakeConfiguration
                  targetValue={targetValue}
                  bonusValue={bonusValue}
                  setBonusValue={setBonusValue}
                  currentMeetsTarget={currentMeetsTarget}
                  projectedMeetsTarget={projectedMeetsTarget}
                  onSubmitDeposit={onSubmitDeposit}
                />
              )}
            </ConnectWalletBlocker>
          </SheetContent>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deposit?</AlertDialogTitle>
              <AlertDialogDescription>
                Deposit quantity is insufficient for the goal. Deposit anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onConfirmDeposit(depositParameters!);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Sheet>
    </TooltipProvider>
  );
};
