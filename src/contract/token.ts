import { getTagValue } from "@/lib/arweave";
import { dryrun } from "@permaweb/aoconnect";
import { queryOptions } from "@tanstack/react-query";

const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;

export const tokenBalanceQuery = (processId: string, walletId: string) =>
  queryOptions({
    queryKey: ["Token", processId, "Balance", walletId],
    queryFn: async () => {
      const res = await dryrun({
        process: processId,
        tags: [
          {
            name: "Action",
            value: "Balance",
          },
          {
            name: "Recipient",
            value: walletId,
          },
        ],
      });
      return parseInt(getTagValue(res.Messages[0].Tags, "Balance")!);
    },
  });
