import { dryrun, message } from "@permaweb/aoconnect";
import { queryOptions } from "@tanstack/react-query";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

export type DepositParameters = {
  tokenId: string;
  quantity: string;
  stakeDurationMs: number;
};

export const getInfoQuery = (processId: string) =>
  queryOptions({
    queryKey: ["Custody", processId, "Info"],
    queryFn: async () => {
      const res = await dryrun({
        process: processId,
        tags: [
          {
            name: "Action",
            value: "Info",
          },
        ],
      });
      const error = getTagValue(res.Messages[0].Tags, "Error");
      if (error) {
        return error;
      }
      return JSON.parse(res.Messages[0].Data);
    },
  });

// {"DepositTimeMs":1727694220888,"Quantity":"10000000000","timestamp":1727694220888,"TokenId":"xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10","WithdrawTimeMs":1727695084888,"Id":"-3QR_EGTf_z0qSw79AbAqjJOsYmeiSV-kaPL2dr7Yyg","Sender":"0cQJ5Hd4oCaL57CWP-Pqe5_e0D4_ZDWuxKBgR9ke1SI","StakeDurationMs":864000},
export type Stake = {
  DepositTimeMs: number;
  Quantity: string;
  timestamp: number;
  TokenId: string;
  WithdrawTimeMs: number;
  Id: string;
  Sender: string;
  StakeDurationMs: number;
};

export type ActiveStakes = {
  ActiveStakes: Stake[];
};

export const getActiveStakesQuery = (processId: string, walletId?: string) =>
  queryOptions({
    queryKey: ["Custody", processId, "Get-Active-Stakes"],
    queryFn: async () => {
      const res = await dryrun({
        process: processId,
        tags: [
          {
            name: "Action",
            value: "Custody.Get-Active-Stakes",
          },
          ...(walletId
            ? [
                {
                  name: "Wallet-Id",
                  value: walletId,
                },
              ]
            : []),
        ],
      });
      const error = getTagValue(res.Messages[0].Tags, "Error");
      if (error) {
        throw new Error(error);
      }
      return JSON.parse(res.Messages[0].Data) as ActiveStakes;
    },
  });

export async function custodyDeposit(
  custodyProcessId: string,
  { tokenId, quantity, stakeDurationMs }: DepositParameters,
  aoSigner: AoSigner,
) {
  const messageId = await message({
    process: tokenId,
    tags: [
      {
        name: "Action",
        value: "Transfer",
      },
      {
        name: "Recipient",
        value: custodyProcessId,
      },
      {
        name: "Quantity",
        value: quantity,
      },
      {
        name: "X-Stake-Duration",
        value: stakeDurationMs.toString(),
      },
    ],
    signer: aoSigner,
  });
  console.log({ messageId });
  return messageId;
}

export async function custodyWithdraw(
  custodyProcessId: string,
  stakeId: string,
  aoSigner: AoSigner,
) {
  const messageId = await message({
    process: custodyProcessId,
    tags: [
      {
        name: "Action",
        value: "Custody.Withdraw",
      },
      {
        name: "Stake-Id",
        value: stakeId,
      },
    ],
    signer: aoSigner,
  });
  console.log({ messageId });
  return messageId;
}
