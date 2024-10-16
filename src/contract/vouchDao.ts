import { ArweaveId } from "@/features/arweave/lib/model";
import { AoSigner } from "@/hooks/useAoSigner";
import { dryrun, message } from "@permaweb/aoconnect";
import { queryOptions } from "@tanstack/react-query";

const VOUCHDAO_PROCESS_ID = import.meta.env.VITE_VOUCHDAO_PROCESS_ID!;

export type VouchValueStr = `${number}-${string}`;
export type VouchValue = {
  value: number;
  currency: string;
};
export type VouchHistory = Record<ArweaveId, VouchValue>;

type VouchDaoGetVouchesResponse =
  | {
      ID: string;
      Status: "NOT_VOUCHED";
    }
  | {
      "Vouches-For": string;
      "Total-Value": VouchValueStr; // "0-USD";
      Vouchers: Record<
        string,
        {
          "Vouch-For": string;
          Value: VouchValueStr; // "0-USD";
          Method: string;
          Identifier: string;
          Country: string;
        }
      >;
    };

export const vouchDaoVouchesQuery = (walletId?: string) =>
  queryOptions({
    queryKey: ["vouchDao", VOUCHDAO_PROCESS_ID, "Get-Vouches", walletId],
    queryFn: async () => {
      const res = await dryrun({
        process: VOUCHDAO_PROCESS_ID,
        tags: [
          {
            name: "Action",
            value: "Get-Vouches",
          },
          {
            name: "ID",
            value: walletId!,
          },
        ],
      });
      const replyData = res.Messages[0].Data;
      const replyDataParsed = JSON.parse(
        replyData,
      ) as VouchDaoGetVouchesResponse;
      console.log(replyDataParsed);
      return replyDataParsed;
    },
    enabled: !!walletId,
  });

export const vouchDaoPromote = async (signer: AoSigner) => {
  const msgId = await message({
    process: VOUCHDAO_PROCESS_ID,
    tags: [
      {
        name: "Action",
        value: "Promote-ID",
      },
    ],
    signer,
  });
  return msgId;
};
