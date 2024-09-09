import { dryrun, message } from "@permaweb/aoconnect";
import { MutationOptions, queryOptions } from "@tanstack/react-query";
import { getTagValue } from "../lib/arweave";
import { AoSigner } from "../hooks/useAoSigner";

const VITE_VOUCHER_PROCESS_ID = import.meta.env.VITE_VOUCHER_PROCESS_ID!;
const VITE_WAR_TOKEN_PROCESS_ID = import.meta.env.VITE_WAR_TOKEN_PROCESS_ID!;

export const vouchStateQuery = (walletId: string) =>
  queryOptions({
    queryKey: ["voucherState", VITE_VOUCHER_PROCESS_ID],
    queryFn: async () => {
      const res = await dryrun({
        process: VITE_VOUCHER_PROCESS_ID,
        Owner: "B8iwcBLRw_yZ-vlqfMK0B2XNh-VIq3nPKVE70ia2Z5w",
        tags: [
          {
            name: "Action",
            value: "Eval",
          },
        ],
        data: `require"json".encode(VOUCH_DB_ADMIN:exec([[SELECT * FROM Wallet WHERE WalletId = "${walletId}"]]))`,
      });
      return JSON.parse(res.Output.data);
    },
  });

export const vouchConfidenceQuery = (quantity: number, duration: number) =>
  queryOptions({
    queryKey: [
      "voucherConfidence",
      VITE_VOUCHER_PROCESS_ID,
      quantity,
      duration,
    ],
    queryFn: async () => {
      const res = await dryrun({
        process: VITE_VOUCHER_PROCESS_ID,
        Owner: "B8iwcBLRw_yZ-vlqfMK0B2XNh-VIq3nPKVE70ia2Z5w",
        tags: [
          {
            name: "Action",
            value: "Vouch.CalculateConfidence",
          },
          {
            name: "TokenId",
            value: VITE_WAR_TOKEN_PROCESS_ID,
          },
          {
            name: "Quantity",
            value: quantity.toString(),
          },
          {
            name: "Duration",
            value: duration.toString(),
          },
        ],
      });
      const tags = res.Messages[0].Tags;
      const result = {
        success: getTagValue(tags, "Confidence-Result") === "Success",
        confidence: parseFloat(getTagValue(tags, "Confidence-Value") ?? 0),
      };
      return result;
    },
  });

export const createCustodyMutation = (aoSigner: AoSigner): MutationOptions => ({
  mutationKey: ["createCustody"],
  mutationFn: async () => {
    const messageId = await message({
      process: VITE_VOUCHER_PROCESS_ID,
      tags: [
        {
          name: "Action",
          value: "Custody.Create",
        },
      ],
      signer: aoSigner,
    });
    console.log({ messageId });
    return messageId;
  },
});
