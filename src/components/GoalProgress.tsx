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
import { InfoCircledIcon } from "@radix-ui/react-icons";

export type GoalProgressProps = {
  targetValue: VouchValue;
  bonusValue?: number;
  projectedMeetsTarget?: boolean;
  profileId?: string;
};

export const GoalProgress = ({
  targetValue,
  bonusValue,
  projectedMeetsTarget,
  profileId,
}: GoalProgressProps) => {
  const hasBonus = bonusValue && bonusValue !== 0;

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  const profileInfo = useProfileInfo({ profileId });
  const profileImage = profileInfo.data?.ProfileImage;

  return (
    <div className="flex flex-row gap-4 items-stretch">
      <Avatar
        className={`w-24 h-24 ${profileInfo.isLoading && "animate-pulse"}`}
      >
        {profileImage && <AvatarImage src={fetchUrl(profileImage)} />}
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col flex-grow-0 justify-center gap-1">
        <div className="text-lg text-primary/80 flex flex-row items-center">
          Goal for access to{" "}
          {profileInfo.isLoading ? (
            <Skeleton className="ml-2 h-4 w-24 animate-pulse" />
          ) : profileInfo.data ? (
            profileInfo.data.DisplayName
          ) : (
            "Permaweb App"
          )}
        </div>
        <Card className="bg-primary/10 flex flex-col justify-center py-3 relative min-w-48 sm:min-w-64 md:min-w-72">
          <div className="absolute top-0 right-0 pr-2 pt-1">
            <HoverCard>
              <HoverCardTrigger>
                <InfoCircledIcon />
              </HoverCardTrigger>
              <HoverCardContent side="top" align="end">
                <VouchBreakdown />
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="text-center text-lg">
            <span
              className={`${hasBonus ? `${projectedMeetsTarget ? "text-green-800 animate-pulse" : "text-red-800"}` : ""}`}
            >
              {vouchData.data?.total !== undefined
                ? Math.floor((vouchData.data.total + (bonusValue ?? 0)) * 100) /
                  100
                : "..."}
            </span>
            {" ⟋ "}
            {targetValue.value}{" "}
            <span className="text-primary/80 text-sm">
              {/* TODO: VouchDAO logo SVG */}V Points
              {targetValue.currency === "USD" ? undefined : (
                <span className=" text-muted-foreground">
                  {" "}
                  ({targetValue.currency})
                </span>
              )}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
