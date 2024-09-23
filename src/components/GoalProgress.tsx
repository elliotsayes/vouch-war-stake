import { Card } from "@/components/ui/card";
import { VouchValue } from "@/contract/vouchDao";
import { useProfileInfo } from "@/features/profile/hooks/useProfileInfo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { fetchUrl } from "@/features/arweave/lib/arweave";
import { Skeleton } from "./ui/skeleton";
import { HoverCard } from "./ui/hover-card";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { useActiveAddress } from "arweave-wallet-kit";
import { VouchBreakdown } from "./VouchBreakdown";

export type GoalProgressProps = {
  targetValue: VouchValue;
  profileId?: string;
};

export const GoalProgress = ({ targetValue, profileId }: GoalProgressProps) => {
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  const profileInfo = useProfileInfo({ profileId });
  const profileImage = profileInfo.data?.ProfileImage;

  return (
    <div className="flex flex-row gap-4 items-stretch">
      <Avatar className="w-24 h-24">
        {profileImage && <AvatarImage src={fetchUrl(profileImage)} />}
        <AvatarFallback
          className={`${profileInfo.isLoading && "animate-pulse"}`}
        />
      </Avatar>
      <div className="flex flex-col flex-grow-0 justify-center gap-1">
        <div className="text-lg text-primary/80 flex flex-row items-center">
          Goal for access to{" "}
          {profileInfo.isLoading ? (
            <Skeleton className="ml-2 h-4 w-12 animate-pulse" />
          ) : profileInfo.data ? (
            profileInfo.data.DisplayName
          ) : (
            "Permaweb App"
          )}
        </div>
        <Card className="bg-primary/10 flex flex-col flex-grow-0 justify-center py-3 relative">
          <div className="absolute top-0 right-0 pr-2 pt-1">
            <HoverCard>
              <HoverCardTrigger>ⓘ</HoverCardTrigger>
              <HoverCardContent align="end">
                <VouchBreakdown />
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="text-center text-lg">
            {vouchData.data?.total
              ? Math.round(vouchData.data.total * 100) / 100
              : "..."}
            {" ⟋ "}
            {targetValue.value}{" "}
            <span className="text-primary/80 text-sm">
              {targetValue.currency}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};