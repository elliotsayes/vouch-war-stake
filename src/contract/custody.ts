import { dryrun, message } from "@permaweb/aoconnect";
import { MutationOptions, queryOptions } from "@tanstack/react-query";
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
        return error;
      }
      return JSON.parse(res.Messages[0].Data);
    },
  });

export const depositMutation = (
  custodyProcessId: string,
  { tokenId, quantity, stakeDurationMs }: DepositParameters,
  aoSigner: AoSigner,
): MutationOptions => ({
  mutationKey: ["Custody", custodyProcessId, "Deposit", tokenId],
  mutationFn: async () => {
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
  },
});
