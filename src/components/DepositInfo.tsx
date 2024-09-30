import {
  custodyWithdraw,
  getActiveStakesQuery,
  Stake,
} from "@/contract/custody";
import { custodyCreatorGetWalletQuery } from "@/contract/custodyCreator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import { useCallback, useMemo } from "react";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "./ui/tooltip";
import {
  CircleIcon,
  DotIcon,
  DownloadIcon,
  InfoCircledIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import { Card, CardContent } from "./ui/card";
import { HoverCard } from "./ui/hover-card";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Button } from "./ui/button";
import useAoSigner from "@/hooks/useAoSigner";
import { LoaderCircleIcon } from "lucide-react";

const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;
const WAR_MULTIPLIER = 10 ** 12;

export const DepositInfo = () => {
  const walletId = useActiveAddress()!;
  const { aoSigner } = useAoSigner();

  const custodyInfo = useQuery(custodyCreatorGetWalletQuery(walletId));

  const activeStakes = useQuery({
    ...getActiveStakesQuery(custodyInfo.data?.processId as string, walletId),
    enabled: custodyInfo.data?.processId !== undefined,
  });

  const warStats = useMemo(() => {
    if (!activeStakes.data) return null;

    const warStakes = activeStakes.data.ActiveStakes.filter(
      (stake: Stake) => stake.TokenId === WAR_TOKEN_PROCESS_ID,
    );

    const locked = warStakes.filter(
      (stake: Stake) => stake.WithdrawTimeMs > Date.now(),
    );
    const lockedSum = locked.reduce(
      (acc: number, stake: Stake) =>
        acc + parseInt(stake.Quantity) / WAR_MULTIPLIER,
      0,
    );
    const unlocked = warStakes.filter(
      (stake: Stake) => !(stake.WithdrawTimeMs > Date.now()),
    );
    const unlockedSum = unlocked.reduce(
      (acc: number, stake: Stake) =>
        acc + parseInt(stake.Quantity) / WAR_MULTIPLIER,
      0,
    );
    return {
      all: warStakes,
      locked,
      unlocked,
      lockedSum,
      unlockedSum,
      totalSum: lockedSum + unlockedSum,
    };
  }, [activeStakes.data]);

  const hasWar = warStats?.totalSum ?? 0 > 0;
  // const hasWarLocked = warStats?.lockedSum ?? 0 > 0;
  const hasWarUnlocked = warStats?.unlockedSum ?? 0 > 0;

  const withdraw = useMutation({
    mutationKey: ["withdraw", custodyInfo.data?.processId, warStats?.unlocked],
    mutationFn: async () => {
      if (custodyInfo.data?.processId && warStats?.unlocked) {
        for (const stake of warStats.unlocked) {
          console.log("withdrawing", stake);
          await custodyWithdraw(
            custodyInfo.data.processId,
            stake.Id,
            aoSigner!,
          );
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    },
  });

  return (
    <div>
      {custodyInfo.isLoading || activeStakes.isLoading ? (
        <div className="animate-pulse bg-primary/20 rounded-md h-6 w-48"></div>
      ) : hasWar ? (
        <div className="flex flex-row items-center">
          <div>
            <span>Currently Staked:</span>
            <span className="ml-2">
              {Math.round((warStats?.totalSum ?? 0) * 100) / 100} $wAR
            </span>
          </div>
          <HoverCard>
            <HoverCardTrigger>
              <InfoCircledIcon className="ml-1" />
            </HoverCardTrigger>
            <HoverCardContent side="top">
              <Card className="py-1 px-2 pb-1">
                <TooltipProvider>
                  <div className="flex flex-col gap-1">
                    <span className="flex flex-row justify-between items-center gap-2">
                      <span>
                        Locked: <span>{warStats?.lockedSum.toFixed(2)}</span>
                      </span>
                      <Button
                        size={"icon"}
                        variant={"default"}
                        className="ml-1 px-2"
                        disabled
                      >
                        <LockClosedIcon />
                      </Button>
                    </span>
                    <span className="flex flex-row justify-between items-center gap-2">
                      <span>
                        Unlocked:{" "}
                        <span>{warStats?.unlockedSum.toFixed(2)}</span>
                      </span>
                      <Tooltip>
                        <TooltipTrigger>
                          {hasWarUnlocked ? (
                            <Button
                              size={"icon"}
                              variant={"outline"}
                              className="ml-1 px-2"
                              onClick={() => {
                                withdraw
                                  .mutateAsync()
                                  .then(() => custodyInfo.refetch());
                              }}
                              disabled={withdraw.isPending}
                            >
                              {withdraw.isPending ? (
                                <LoaderCircleIcon className="animate-spin" />
                              ) : (
                                <DownloadIcon />
                              )}
                            </Button>
                          ) : (
                            <Button
                              size={"icon"}
                              variant={"default"}
                              className="ml-1 px-2 bg-gray-400"
                              disabled
                            >
                              <DownloadIcon />
                            </Button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-60">
                          {hasWarUnlocked
                            ? "Withdraw unlocked $wAR from custody."
                            : "No unlocked $wAR to withdraw."}
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </div>
                </TooltipProvider>
              </Card>
            </HoverCardContent>
          </HoverCard>
        </div>
      ) : (
        <div>
          Deposit $wAR into the{" "}
          <a
            className="underline text-blue-900"
            href={`https://ao.link/#/entity/${import.meta.env.VITE_CUSTODY_CREATOR_PROCESS_ID!}`}
            target="_blank"
          >
            custody contract
          </a>
          .<br />
          <span className="text-muted-foreground">
            Your $wAR may be withdrawn after the Stake period.
          </span>
        </div>
      )}
    </div>
  );
};
