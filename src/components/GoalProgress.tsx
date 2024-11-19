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
import { AlertCircleIcon, CheckIcon, InfoIcon } from "lucide-react";
import { SubIdNotice } from "./SubIdNotice";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export type GoalProgressProps = {
  targetValue?: VouchValue;
  bonusValue?: number;
  currentMeetsTarget?: boolean;
  projectedMeetsTarget?: boolean;
  profileId?: string;
  appLink?: string;
};

export const GoalProgress = ({
  targetValue,
  bonusValue,
  currentMeetsTarget,
  projectedMeetsTarget,
  profileId,
  appLink,
}: GoalProgressProps) => {
  const hasTarget = targetValue !== undefined;
  const hasBonus = bonusValue && bonusValue !== 0;

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);
  const isVouched = vouchData.data?.for !== undefined;
  const isSubId = isVouched && vouchData.data?.for !== walletId;

  const profileInfo = useProfileInfo({
    profileId,
    walletId: hasTarget ? undefined : walletId,
  });
  const profileImage = profileInfo.data?.ProfileImage;
  const profileName = profileInfo.data?.DisplayName;

  return (
    <div className="flex flex-row gap-4 items-stretch">
      <div className="relative">
        <Avatar
          className={` w-24 h-24 text-gray-600 ${profileInfo.isLoading && "animate-pulse"}`}
        >
          {profileImage && <AvatarImage src={fetchUrl(profileImage)} />}
          <AvatarFallback>
            {!hasTarget && (
              <img src={"../images/user.svg"} className="w-24 h-24" />
            )}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-1/4 h-1/4 rounded-full transition-opacity duration-500 bg-green-500/20 ${currentMeetsTarget ? "opacity-100" : "opacity-0"}`}
        >
          <Tooltip>
            <TooltipTrigger
              disabled={!currentMeetsTarget}
              className="w-full h-full"
            >
              <div
                className={`w-full h-full flex flex-col justify-center rounded-full shadow-green-500 ${currentMeetsTarget ? "animate-pulse" : ""}`}
              >
                <CheckIcon
                  className="text-green-600 w-full h-full m-0.5 mt-1 mx-auto"
                  strokeWidth={3}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Vouch goal met!</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col flex-grow-0 justify-center gap-1">
        <div className="text-md text-primary/80 flex flex-row items-center px-1">
          {hasTarget ? (
            <>
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
                  {profileName ?? "Permaweb App"}
                  <ExternalLinkIcon className="w-3 h-3 inline-block" />
                </a>
              ) : (
                <> {profileName ?? "Permaweb App"}</>
              )}
            </>
          ) : (
            <span>
              {profileName ? (
                <span className=" text-gray-800/80">{profileName}'s</span>
              ) : (
                "Your"
              )}{" "}
              Vouch Status
            </span>
          )}
        </div>
        <Card
          className={`bg-primary/5 flex flex-col justify-center py-3 relative ${hasTarget ? "min-w-48 sm:min-w-64 md:min-w-72" : "min-w-48"}`}
        >
          <div className="absolute top-0 right-0 pr-1 pt-0">
            <HoverCard>
              {isSubId ? (
                <>
                  <HoverCardTrigger className="relative cursor-pointer">
                    <AlertCircleIcon className="w-4 text-red-600/60 duration-1000" />
                    <AlertCircleIcon className="absolute top-0 right-0 w-4 text-red-500/20 animate-ping" />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="end">
                    <SubIdNotice mainAddress={vouchData.data!.for!} />
                  </HoverCardContent>
                </>
              ) : (
                <>
                  <HoverCardTrigger className="cursor-pointer">
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
                className={`${currentMeetsTarget ? "text-green-800" : ""} ${hasTarget && hasBonus && !currentMeetsTarget ? `${projectedMeetsTarget ? "text-green-800 shadow-green-900 animate-pulse" : "text-red-800"}` : ""}`}
              >
                {vouchData.data?.score !== undefined && !isSubId
                  ? Math.floor(
                      (vouchData.data.score + (bonusValue ?? 0)) * 100,
                    ) / 100
                  : "..."}
              </span>
              {hasTarget && (
                <>
                  {" ⟋ "}
                  {targetValue.value}{" "}
                </>
              )}
            </div>
            <VPoints />
          </div>
        </Card>
      </div>
    </div>
  );
};
