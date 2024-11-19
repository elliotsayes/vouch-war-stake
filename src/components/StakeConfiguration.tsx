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
import { DepositInfo } from "./DepositInfo";

const dayMs = 24 * 60 * 60 * 1000;
const yearMs = 365 * dayMs;
const maxStakeTimeMs = yearMs;

export interface StakeConfigurationProps {
  targetValue?: VouchValue;
  bonusValue: number;
  setBonusValue: (value: number) => void;
  projectedMeetsTarget?: boolean;
  onSubmitDeposit: (depositParameters: DepositParameters) => void;
}

const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;
const WAR_MULTIPLIER = 10 ** 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // projectedMeetsTarget,
  onSubmitDeposit,
}: StakeConfigurationProps) => {
  const [quantity, setQuantity] = useState(0);
  const [stakeTime, setStakeTime] = useState(maxStakeTimeMs);
  const [isAuto, setIsAuto] = useState(false);

  const vouchCustodyInfo = useQuery(vouchCustodyInfoQuery());

  const walletId = useActiveAddress()!;
  const warBalance = useQuery(
    tokenBalanceQuery(WAR_TOKEN_PROCESS_ID, walletId),
  );

  const hasTarget = targetValue !== undefined;
  const hasBonusAboveMinimum = bonusValue > 0.01;
  const quantityMinor = BigInt(Math.ceil(quantity * WAR_MULTIPLIER));
  const hasSufficientBalance =
    warBalance.isSuccess && BigInt(warBalance.data) >= quantityMinor;

  const vouchData = useWhitelistedVouchData(walletId);

  const fired = useRef(false);
  const setParametersAuto = useCallback(() => {
    if (!hasTarget) {
      return false;
    }
    if (vouchData.data?.total === undefined) {
      return false;
    }
    if (!vouchCustodyInfo.data) {
      return false;
    }

    // Calculate required to meet target
    const requiredToMeetTarget = hasTarget
      ? targetValue.value - vouchData.data.total
      : 0;

    if (requiredToMeetTarget <= 0) {
      setQuantity(0);
    } else {
      const { price, interestRate } = warStats(vouchCustodyInfo.data);

      const quantity =
        (requiredToMeetTarget * yearMs) / (price * interestRate * stakeTime);

      setQuantity(quantity);
    }
    setIsAuto(true);
    return true;
  }, [
    hasTarget,
    stakeTime,
    targetValue?.value,
    vouchCustodyInfo.data,
    vouchData.data?.total,
  ]);

  useEffect(() => {
    if (!vouchCustodyInfo.data) return;

    const { price, interestRate } = warStats(vouchCustodyInfo.data);

    const bonus = quantity * price * interestRate * (stakeTime / yearMs);

    setBonusValue(bonus);
  }, [vouchCustodyInfo.data, quantity, setBonusValue, stakeTime]);

  useEffect(() => {
    if (fired.current) return;
    if (setParametersAuto()) fired.current = true;
  }, [vouchData.isSuccess, vouchCustodyInfo.isSuccess, setParametersAuto]);

  const isLoading = vouchData.isLoading || vouchCustodyInfo.isLoading;

  if (!isLoading && (!vouchData.isSuccess || !vouchCustodyInfo.isSuccess)) {
    return <div>Something went wrong!</div>;
  }

  return (
    <TooltipProvider>
      <div className="md:w-[80%] max-w-sm mx-auto py-4 ">
        <div>
          <DepositInfo />
        </div>
        <div className="my-4 relative">
          <Button
            disabled={isAuto || isLoading}
            variant={"outline"}
            size={"sm"}
            onClick={setParametersAuto}
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
                  min={0.01}
                  max={100}
                  step={0.1}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val)) return;
                    const unsignedValue = Math.max(0, val);
                    setQuantity(Math.min(unsignedValue, 100));
                    setIsAuto(false);
                  }}
                />
                $wAR
              </div>
              <Slider
                disabled={isLoading}
                min={0.01}
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
                Stake period
                <Input
                  disabled={isLoading}
                  type="number"
                  className="ml-2 mr-1 w-24"
                  value={Math.ceil((100 * stakeTime) / dayMs) / 100}
                  max={maxStakeTimeMs / dayMs}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val)) return;
                    const valueDays = Math.max(0, val);
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
            {hasSufficientBalance && (!hasTarget || hasBonusAboveMinimum) ? (
              <Button
                disabled={isLoading}
                onClick={() => {
                  onSubmitDeposit({
                    tokenId: WAR_TOKEN_PROCESS_ID,
                    quantity: quantityMinor.toString(),
                    stakeDurationMs: stakeTime,
                  });
                }}
              >
                Stake $wAR
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <Button disabled>
                    {!hasSufficientBalance
                      ? "Insufficient $wAR..."
                      : "Vouch points too low..."}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <Card className="text-center px-2 my-1">
                    Wrap your $AR at{" "}
                    <a
                      href="https://aox.xyz/"
                      target="_blank"
                      className="underline text-blue-900"
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
                      className="underline text-blue-900"
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
      </div>
    </TooltipProvider>
  );
};
