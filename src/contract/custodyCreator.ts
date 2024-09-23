import { dryrun, message } from "@permaweb/aoconnect";
import { MutationOptions, queryOptions } from "@tanstack/react-query";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

const CUSTODY_CREATOR_PROCESS_ID = import.meta.env
  .VITE_CUSTODY_CREATOR_PROCESS_ID!;

export const getWalletQuery = (walletId: string) =>
  queryOptions({
    queryKey: [
      "Custody-Creator",
      CUSTODY_CREATOR_PROCESS_ID,
      "Get-Wallet",
      walletId,
    ],
    queryFn: async () => {
      const res = await dryrun({
        process: CUSTODY_CREATOR_PROCESS_ID,
        tags: [
          {
            name: "Action",
            value: "Custody-Creator.Get-Wallet",
          },
          {
            name: "Wallet-Id",
            value: walletId,
          },
        ],
      });
      const error = getTagValue(res.Messages[0].Tags, "Error");
      if (error) {
        return error;
      }
      return getTagValue(res.Messages[0].Tags, "Status");
    },
  });

export const createCustodyMutation = (aoSigner: AoSigner): MutationOptions => ({
  mutationKey: ["createCustody", CUSTODY_CREATOR_PROCESS_ID],
  mutationFn: async () => {
    const messageId = await message({
      process: CUSTODY_CREATOR_PROCESS_ID,
      tags: [
        {
          name: "Action",
          value: "Custody-Creator.Create-Custody",
        },
      ],
      signer: aoSigner,
    });
    console.log({ messageId });
    return messageId;
  },
});
