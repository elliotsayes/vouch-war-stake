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

export interface VouchProgressProps {
  targetValue: VouchValue;
  profileId?: string;
}

export const VouchProgress = ({
  targetValue,
  profileId,
}: VouchProgressProps) => {
  const [showStakeSheet, setShowStakeSheet] = useState(false);
  const [showConfirmQuitDialog, setShowConfirmQuitDialog] = useState(false);

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
              <GoalProgress targetValue={targetValue} profileId={profileId} />
            </div>
            <div>
              <h1 className="text-lg mb-2 text-muted-foreground">
                Increase your vouch score with these services
              </h1>
              <VouchButtons
                onActionVoucherClick={() => setShowStakeSheet(true)}
              />
            </div>
          </div>
        </div>
        <SheetContent
          side={"bottom"}
          onInteractOutside={(e) => {
            e.preventDefault();
            setShowConfirmQuitDialog(true);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            setShowConfirmQuitDialog(true);
          }}
        >
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </SheetHeader>
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
