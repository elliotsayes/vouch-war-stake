import { dryrun, message } from "@permaweb/aoconnect";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

const CUSTODY_CREATOR_PROCESS_ID = import.meta.env
  .VITE_CUSTODY_CREATOR_PROCESS_ID!;

export const custodyCreatorGetWalletQuery = (walletId: string) => ({
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
      throw new Error(error);
    }
    return {
      status: getTagValue(res.Messages[0].Tags, "Status")!,
      walletId: getTagValue(res.Messages[0].Tags, "Wallet-Id")!,
      processId: getTagValue(res.Messages[0].Tags, "Process-Id"),
    };
  },
});

export const custodyCreatorCreateCustody = async (aoSigner: AoSigner) => {
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
};
