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
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { VPoints } from "./VPoints";
import { AlertCircleIcon, InfoIcon } from "lucide-react";
import { SubIdNotice } from "./SubIdNotice";

export type GoalProgressProps = {
  targetValue: VouchValue;
  bonusValue?: number;
  projectedMeetsTarget?: boolean;
  profileId?: string;
  appLink?: string;
};

export const GoalProgress = ({
  targetValue,
  bonusValue,
  projectedMeetsTarget,
  profileId,
  appLink,
}: GoalProgressProps) => {
  const hasBonus = bonusValue && bonusValue !== 0;

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);
  const isVouched = vouchData.data?.for !== undefined;
  const isSubId = isVouched && vouchData.data?.for !== walletId;

  const profileInfo = useProfileInfo({ profileId });
  const profileImage = profileInfo.data?.ProfileImage;
  const profileName = profileInfo.data
    ? profileInfo.data.DisplayName
    : "Permaweb App";

  return (
    <div className="flex flex-row gap-4 items-stretch">
      <Avatar
        className={`w-24 h-24 ${profileInfo.isLoading && "animate-pulse"}`}
      >
        {profileImage && <AvatarImage src={fetchUrl(profileImage)} />}
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col flex-grow-0 justify-center gap-1">
        <div className="text-md text-primary/80 flex flex-row items-center px-1">
          Goal for access to
          {profileInfo.isLoading ? (
            <Skeleton className="ml-2 h-4 w-24 animate-pulse" />
          ) : appLink !== undefined ? (
            <a
              href={appLink}
              target="_blank"
              rel="noreferrer"
              className="underline block ml-1"
            >
              {profileName}
              <ExternalLinkIcon className="w-3 h-3 inline-block" />
            </a>
          ) : (
            <> {profileName}</>
          )}
        </div>
        <Card className="bg-primary/5 flex flex-col justify-center py-3 relative min-w-48 sm:min-w-64 md:min-w-72">
          <div className="absolute top-0 right-0 pr-1 pt-0">
            <HoverCard>
              {isSubId ? (
                <>
                  <HoverCardTrigger className="relative">
                    <AlertCircleIcon className="w-4 text-red-600/60 duration-1000" />
                    <AlertCircleIcon className="absolute top-0 right-0 w-4 text-red-500/20 animate-ping" />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="end">
                    <SubIdNotice mainAddress={vouchData.data!.for!} />
                  </HoverCardContent>
                </>
              ) : (
                <>
                  <HoverCardTrigger>
                    <InfoIcon className="w-4" />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="end">
                    <VouchBreakdown />
                  </HoverCardContent>
                </>
              )}
            </HoverCard>
          </div>
          <div className="text-center text-lg flex flex-row justify-center items-center gap-2">
            <div>
              <span
                className={`${hasBonus ? `${projectedMeetsTarget ? "text-green-800 animate-pulse" : "text-red-800"}` : ""}`}
              >
                {vouchData.data?.total !== undefined && !isSubId
                  ? Math.floor(
                      (vouchData.data.total + (bonusValue ?? 0)) * 100,
                    ) / 100
                  : "..."}
              </span>
              {" ⟋ "}
              {targetValue.value}{" "}
            </div>
            <VPoints />
          </div>
        </Card>
      </div>
    </div>
  );
};
