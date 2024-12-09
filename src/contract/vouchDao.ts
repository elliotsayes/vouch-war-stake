import { ArweaveId } from "@/features/arweave/lib/model";
import { AoSigner } from "@/hooks/useAoSigner";
import { dryrun, message } from "@permaweb/aoconnect";
import { queryOptions } from "@tanstack/react-query";
import { DryRunResult } from "node_modules/@permaweb/aoconnect/dist/lib/dryrun";

const VOUCHDAO_PROCESS_ID = import.meta.env.VITE_VOUCHDAO_PROCESS_ID!;

export type VouchValueStr = `${number}-${string}`;
export type VouchValue = {
  value: number;
  currency: string;
};
export type VouchHistory = Record<ArweaveId, VouchValue>;

export type VouchDaoGetVouchesResponseNotVouched = {
  ID: string;
  Status: "NOT_VOUCHED";
};

export type VouchDaoGetVouchesResponseIsVouched = {
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

export type VouchDaoGetVouchesResponse =
  | VouchDaoGetVouchesResponseNotVouched
  | VouchDaoGetVouchesResponseIsVouched;

export const vouchDaoVouchesQuery = (walletId?: string) =>
  queryOptions({
    queryKey: ["vouchDao", VOUCHDAO_PROCESS_ID, "Get-Vouches", walletId],
    queryFn: async () => {
      // Abort after 5 seconds
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(false), 10_000),
      );
      const runPromise = dryrun({
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
      const maybeRes = await Promise.race([timeoutPromise, runPromise]);
      if (!maybeRes) {
        throw new Error("Timeout");
      }
      const res = maybeRes as DryRunResult;
      const replyData = res.Messages[0].Data;
      return JSON.parse(replyData) as VouchDaoGetVouchesResponse;
    },
    enabled: !!walletId,
    retry: false,
    retryOnMount: false,
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
