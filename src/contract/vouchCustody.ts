import { dryrun, message } from "@permaweb/aoconnect";
import { MutationOptions, queryOptions } from "@tanstack/react-query";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

const VOUCH_CUSTODY_PROCESS_ID = import.meta.env.VITE_VOUCH_CUSTODY_PROCESS_ID!;
const WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;

export const vouchCustodyInfoQuery = () =>
  queryOptions({
    queryKey: ["vouchCustody", "Info", VOUCH_CUSTODY_PROCESS_ID],
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
      console.log({ vouchCustodyInfo: data });
      return data;
    },
  });
