import { vouchCustodyInfoQuery } from "@/contract/vouchCustody";
import { VouchValue } from "@/contract/vouchDao";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import { Slider } from "./ui/slider";
import { useCallback, useEffect, useRef, useState } from "react";
import { set } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const yearMs = 365 * 24 * 60 * 60 * 1000;
const maxStakeTime = yearMs;

export interface StakeConfigurationProps {
  targetValue: VouchValue;
  bonusValue: number;
  setBonusValue: (value: number) => void;
  projectedMeetsTarget?: boolean;
}

export const StakeConfiguration = ({
  targetValue,
  bonusValue,
  setBonusValue,
  projectedMeetsTarget,
}: StakeConfigurationProps) => {
  const [quantity, setQuantity] = useState(0);
  const [stakeTime, setStakeTime] = useState(0);
  const [isAuto, setIsAuto] = useState(false);

  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);
  const vouchCustodyInfo = useQuery(vouchCustodyInfoQuery());

  // if (vouchData.isLoading || vouchCustodyInfo.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (!vouchData.isSuccess || !vouchCustodyInfo.isSuccess) {
  //   return <div>Something went wrong!</div>;
  // }

  const fired = useRef(false);
  const calculateAuto = useCallback(() => {
    if (!vouchData.data?.total) {
      return false;
    }
    // if (!vouchCustodyInfo.data) {
    //   return false;
    // }
    setStakeTime(maxStakeTime);

    // Calculate required to meet target
    const requiredToMeetTarget = targetValue.value - vouchData.data.total;

    if (requiredToMeetTarget <= 0) {
      setQuantity(0);
    } else {
      const price = 20;
      const interestRate = 0.1;

      const quantity =
        (requiredToMeetTarget * yearMs) / (price * interestRate * maxStakeTime);

      setQuantity(quantity);
    }
    setIsAuto(true);
    return true;
  }, [
    targetValue.value,
    // vouchCustodyInfo.data,
    vouchData.data?.total,
  ]);

  useEffect(() => {
    // if (!vouchCustodyInfo.data) return;

    const interestRate = 0.1;
    const price = 20;

    const bonus = (quantity * price * interestRate * stakeTime) / yearMs;

    setBonusValue(bonus);
  }, [vouchCustodyInfo.data, quantity, setBonusValue, stakeTime]);

  useEffect(() => {
    if (fired.current) return;
    if (calculateAuto()) fired.current = true;
  }, [vouchData.isSuccess, vouchCustodyInfo.isSuccess, calculateAuto]);

  return (
    <div className="md:w-[80%] max-w-sm mx-auto my-4 py-4 relative">
      <Button
        disabled={isAuto}
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
              type="number"
              className="ml-2 w-20"
              step={0.1}
              value={quantity}
              onChange={(e) => {
                setQuantity(parseFloat(e.target.value));
                setIsAuto(false);
              }}
            />
            $wAR
          </div>
          <Slider
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
              type="number"
              className="ml-2 w-20"
              value={Math.ceil((100 * stakeTime) / (24 * 60 * 60 * 1000)) / 100}
              onChange={(e) => {
                setStakeTime(parseFloat(e.target.value) * 24 * 60 * 60 * 1000);
                setIsAuto(false);
              }}
            />
            days
          </div>
          <Slider
            min={0}
            max={maxStakeTime}
            step={1}
            value={[stakeTime]}
            onValueChange={(value) => {
              setStakeTime(value[0]);
              setIsAuto(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
