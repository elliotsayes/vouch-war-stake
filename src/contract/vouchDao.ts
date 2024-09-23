import { dryrun } from "@permaweb/aoconnect";
import { queryOptions } from "@tanstack/react-query";

const VOUCHDAO_PROCESS_ID = import.meta.env.VITE_VOUCHDAO_PROCESS_ID!;

type VouchDaoGetVouchesResponse =
  | {
      ID: string;
      Status: "NOT_VOUCHED";
    }
  | {
      "Vouches-For": string;
      "Total-Value": string; // "0-USD";
      Vouchers: Record<
        string,
        | Record<string, unknown> & {
            Value: string; // "0-USD";
          }
      >;
    };

export const vouchDaoVouchesQuery = (walletId: string) =>
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
            value: walletId,
          },
        ],
      });
      const replyData = res.Messages[0].Data;
      const replyDataParsed = JSON.parse(
        replyData
      ) as VouchDaoGetVouchesResponse;
      console.log(replyDataParsed);
      return replyDataParsed;
    },
  });
