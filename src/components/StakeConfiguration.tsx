import { vouchCustodyInfoQuery } from "@/contract/vouchCustody";
import { VouchValue } from "@/contract/vouchDao";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import { Slider } from "./ui/slider";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { tokenBalanceQuery } from "@/contract/token";
import { Tooltip, TooltipTrigger } from "./ui/tooltip";
import { TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { Card } from "./ui/card";
import { DepositParameters } from "@/contract/custody";

const dayMs = 24 * 60 * 60 * 1000;
const yearMs = 365 * dayMs;
const maxStakeTimeMs = yearMs;

export interface StakeConfigurationProps {
  targetValue: VouchValue;
  bonusValue: number;
  setBonusValue: (value: number) => void;
  projectedMeetsTarget?: boolean;
  onConfirmDeposit: (depositParameters: DepositParameters) => void;
}

const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;
const WAR_MULTIPLIER = 10 ** 12;

function warStats(infoData: any) {
  return {
    price: infoData.TokenWhitelist[WAR_TOKEN_PROCESS_ID].ValueUsd,
    interestRate: infoData.TokenWhitelist[WAR_TOKEN_PROCESS_ID].InterestRate,
  };
}

export const StakeConfiguration = ({
  targetValue,
  bonusValue,
  setBonusValue,
  projectedMeetsTarget,
  onConfirmDeposit,
}: StakeConfigurationProps) => {
  const [quantity, setQuantity] = useState(0);
  const [stakeTime, setStakeTime] = useState(0);
  const [isAuto, setIsAuto] = useState(false);

  const vouchCustodyInfo = useQuery(vouchCustodyInfoQuery());

  const walletId = useActiveAddress();
  const warBalance = useQuery(
    tokenBalanceQuery(WAR_TOKEN_PROCESS_ID, walletId!),
  );
  const hasSufficientBalance =
    warBalance.isSuccess && warBalance.data >= quantity * WAR_MULTIPLIER;

  const vouchData = useWhitelistedVouchData(walletId!);

  const fired = useRef(false);
  const calculateAuto = useCallback(() => {
    if (!vouchData.data?.total) {
      return false;
    }
    if (!vouchCustodyInfo.data) {
      return false;
    }
    setStakeTime(maxStakeTimeMs);

    // Calculate required to meet target
    const requiredToMeetTarget = targetValue.value - vouchData.data.total;

    if (requiredToMeetTarget <= 0) {
      setQuantity(0);
    } else {
      const { price, interestRate } = warStats(vouchCustodyInfo.data);

      const quantity =
        (requiredToMeetTarget * yearMs) /
        (price * interestRate * maxStakeTimeMs);

      setQuantity(quantity);
    }
    setIsAuto(true);
    return true;
  }, [targetValue.value, vouchCustodyInfo.data, vouchData.data?.total]);

  useEffect(() => {
    if (!vouchCustodyInfo.data) return;

    const { price, interestRate } = warStats(vouchCustodyInfo.data);

    const bonus = (quantity * price * interestRate * stakeTime) / yearMs;

    setBonusValue(bonus);
  }, [vouchCustodyInfo.data, quantity, setBonusValue, stakeTime]);

  useEffect(() => {
    if (fired.current) return;
    if (calculateAuto()) fired.current = true;
  }, [vouchData.isSuccess, vouchCustodyInfo.isSuccess, calculateAuto]);

  const isLoading = vouchData.isLoading || vouchCustodyInfo.isLoading;

  if (!isLoading && (!vouchData.isSuccess || !vouchCustodyInfo.isSuccess)) {
    return <div>Something went wrong!</div>;
  }

  return (
    <TooltipProvider>
      <div className="md:w-[80%] max-w-sm mx-auto my-4 py-4 relative">
        <Button
          disabled={isAuto || isLoading}
          variant={"outline"}
          size={"sm"}
          onClick={calculateAuto}
          className="absolute right-0 top-0"
        >
          Auto
        </Button>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              Quantity{" "}
              <Input
                disabled={isLoading}
                type="number"
                className="ml-2 mr-1 w-24"
                step={0.1}
                max={100}
                value={quantity}
                onChange={(e) => {
                  const unsignedValue = Math.max(0, parseFloat(e.target.value));
                  setQuantity(Math.min(unsignedValue, 100));
                  setIsAuto(false);
                }}
              />
              $wAR
            </div>
            <Slider
              disabled={isLoading}
              min={0}
              max={100}
              step={0.1}
              value={[quantity]}
              onValueChange={(value) => {
                setQuantity(value[0]);
                setIsAuto(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              Stake time
              <Input
                disabled={isLoading}
                type="number"
                className="ml-2 mr-1 w-24"
                value={Math.ceil((100 * stakeTime) / dayMs) / 100}
                max={maxStakeTimeMs / dayMs}
                onChange={(e) => {
                  const valueDays = Math.max(0, parseFloat(e.target.value));
                  setStakeTime(Math.min(maxStakeTimeMs, valueDays * dayMs));
                  setIsAuto(false);
                }}
              />
              days
            </div>
            <Slider
              disabled={isLoading}
              min={0}
              max={maxStakeTimeMs}
              step={1}
              value={[stakeTime]}
              onValueChange={(value) => {
                setStakeTime(value[0]);
                setIsAuto(false);
              }}
            />
          </div>
        </div>
        <div className="mt-6 mb-4 flex flex-col items-center">
          {hasSufficientBalance ? (
            <Button
              disabled={isLoading}
              onClick={() => {
                onConfirmDeposit({
                  tokenId: WAR_TOKEN_PROCESS_ID,
                  quantity: (quantity * WAR_MULTIPLIER).toString(),
                  stakeDurationMs: stakeTime,
                });
              }}
            >
              Stake $wAR
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Button disabled={!hasSufficientBalance || isLoading}>
                  Insufficient $wAR...
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <Card className="text-center px-2 my-1">
                  Wrap your $AR at{" "}
                  <a
                    href="https://aox.xyz/"
                    target="_blank"
                    className="underline text-blue-800"
                    rel="noreferrer"
                  >
                    aox.xyz
                  </a>{" "}
                  or trade for
                  <br />
                  ETH/USDC at{" "}
                  <a
                    href="https://wardepot.arweave.net/"
                    target="_blank"
                    className="underline text-blue-800"
                    rel="noreferrer"
                  >
                    wardepot.arweave.net
                  </a>
                </Card>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
