import ProfileButton from "@/features/profile/components/ProfileButton";
import { GoalProgress } from "../GoalProgress";
import { vouchDaoVouchesQuery, VouchValue } from "@/contract/vouchDao";
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit";
import { VouchBreakdown } from "../VouchBreakdown";
import { useQuery } from "@tanstack/react-query";
import { VouchButtons } from "../VouchButtons";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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

export interface VouchProgressProps {
  targetValue: VouchValue;
  profileId?: string;
  onConfirmDeposit: (depositParameters: DepositParameters) => void;
}

export const VouchProgress = ({
  targetValue,
  profileId,
  onConfirmDeposit,
}: VouchProgressProps) => {
  const [showStakeSheet, setShowStakeSheet] = useState(false);
  const [showConfirmQuitDialog, setShowConfirmQuitDialog] = useState(false);

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  // const requiredToMeetTarget = targetValue.value - (vouchData.data?.total ?? 0);

  const [bonusValue, setBonusValue] = useState(0);

  const projectedValue = (vouchData.data?.total ?? 0) + bonusValue;
  const projectedMeetsTarget = projectedValue >= targetValue.value;

  return (
    <Sheet open={showStakeSheet} onOpenChange={setShowStakeSheet}>
      <AlertDialog
        open={showConfirmQuitDialog}
        onOpenChange={setShowConfirmQuitDialog}
      >
        <div className="flex flex-col h-screen relative">
          <div className="absolute top-0 right-0 p-2">
            <ConnectButton />
          </div>
          {/* Centered box */}
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold pb-4">
              Get Vouched <br />
              on the Permaweb
            </h1>
            <div className="pb-4">
              <GoalProgress
                targetValue={targetValue}
                {...(showStakeSheet
                  ? {
                      bonusValue,
                      projectedMeetsTarget,
                    }
                  : {})}
                profileId={profileId}
              />
            </div>
            <div
              className={`transition-opacity duration-500 ${showStakeSheet ? "opacity-20" : ""}`}
            >
              <h1 className="text-lg mb-4 text-muted-foreground">
                Increase your vouch score with these services
              </h1>
              <VouchButtons
                onActionVoucherClick={() => setShowStakeSheet(true)}
              />
            </div>
            <div
              className={`transition-all duration-500 ${showStakeSheet ? "h-1/4" : "h-0"}`}
            />
          </div>
        </div>
        <SheetContent
          onInteractOutside={(e) => {
            e.preventDefault();
            setShowConfirmQuitDialog(true);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            setShowConfirmQuitDialog(true);
          }}
          side={"bottom"}
        >
          <SheetHeader className="md:w-[80%] max-w-md mx-auto">
            <SheetTitle className="text-center">
              Earn vouch points by staking wrapped Arweave
            </SheetTitle>
          </SheetHeader>
          <StakeConfiguration
            targetValue={targetValue}
            bonusValue={bonusValue}
            setBonusValue={setBonusValue}
            projectedMeetsTarget={projectedMeetsTarget}
            onConfirmDeposit={onConfirmDeposit}
          />
        </SheetContent>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Staking?</AlertDialogTitle>
            <AlertDialogDescription>
              Form data will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowStakeSheet(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};
