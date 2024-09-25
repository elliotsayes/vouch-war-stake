import { DepositParameters } from "@/contract/custody";

interface StakeProgressProps {
  depositParameters: DepositParameters;
}

export const StakeProgress = ({ depositParameters }: StakeProgressProps) => {
  return <div>{JSON.stringify(depositParameters)}</div>;
};
