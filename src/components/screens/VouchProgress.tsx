import ProfileButton from "@/features/profile/components/ProfileButton";
import { GoalProgress } from "../GoalProgress";
import { vouchDaoVouchesQuery, VouchValue } from "@/contract/vouchDao";
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit";
import { VouchBreakdown } from "../VouchBreakdown";
import { useQuery } from "@tanstack/react-query";
import { VouchButtons } from "../VouchButtons";
import { useState } from "react";

export interface VouchProgressProps {
  targetValue: VouchValue;
  profileId?: string;
}

export const VouchProgress = ({
  targetValue,
  profileId,
}: VouchProgressProps) => {
  const walletId = useActiveAddress();
  const [showModal, setShowModal] = useState(false);

  return (
    // Full Screen
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
          <h1 className="text-lg mb-4 text-muted-foreground">
            Increase your vouch score with these services
          </h1>
          <VouchButtons onActionVoucherClick={() => setShowModal(true)} />
        </div>
      </div>
    </div>
  );
};
