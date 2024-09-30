import { dryrun, message } from "@permaweb/aoconnect";
import { MutationOptions, queryOptions } from "@tanstack/react-query";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

const VOUCH_CUSTODY_PROCESS_ID = import.meta.env.VITE_VOUCH_CUSTODY_PROCESS_ID!;
const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;

export const vouchCustodyInfoQuery = () =>
  queryOptions({
    queryKey: ["Vouch-Custody", VOUCH_CUSTODY_PROCESS_ID, "Info"],
    queryFn: async () => {
      const res = await dryrun({
        process: VOUCH_CUSTODY_PROCESS_ID,
        tags: [
          {
            name: "Action",
            value: "Info",
          },
        ],
      });
      const data = JSON.parse(res.Messages[0].Data);
      return data;
    },
  });

export const vouchCustodyGetProcessIdQuery = (walletId: string) =>
  queryOptions({
    queryKey: [
      "Vouch-Custody",
      VOUCH_CUSTODY_PROCESS_ID,
      "Get-Custody-Process",
    ],
    queryFn: async () => {
      const res = await dryrun({
        process: VOUCH_CUSTODY_PROCESS_ID,
        Owner: walletId,
        tags: [
          {
            name: "Action",
            value: "Vouch-Custody.Get-Custody-Process",
          },
        ],
      });
      return {
        status: getTagValue(res.Messages[0].Tags, "Status"),
        processId: getTagValue(res.Messages[0].Tags, "Custody-Process-Id"),
      };
    },
  });

// Vouch-Custody.Register-Custody

export const vouchCustodyRegisterCustody = async (aoSigner: AoSigner) => {
  const messageId = await message({
    process: VOUCH_CUSTODY_PROCESS_ID,
    tags: [
      {
        name: "Action",
        value: "Vouch-Custody.Register-Custody",
      },
    ],
    signer: aoSigner,
  });
  console.log({ messageId });
  return messageId;
};
