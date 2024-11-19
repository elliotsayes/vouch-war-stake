import {
  VouchDaoGetVouchesResponseIsVouched,
  vouchDaoVouchesQuery,
} from "@/contract/vouchDao";
import { vouchLookupByAddress } from "@/lib/vouchers";
import { useQuery } from "@tanstack/react-query";

export type GetVouchesProcessed =
  | {
      for: string;
      score: number;
      history: Record<
        string,
        VouchDaoGetVouchesResponseIsVouched["Vouchers"][string]
      >;
    }
  | {
      for: undefined;
      score: 0;
      history: Record<
        string,
        VouchDaoGetVouchesResponseIsVouched["Vouchers"][string]
      >;
    };

export const useWhitelistedVouchData = (walletId?: string) => {
  const vouchesRaw = useQuery(vouchDaoVouchesQuery(walletId));

  const vouchesHistory = useQuery({
    queryKey: ["vouchesHistory", vouchesRaw.data],
    queryFn: async () => {
      if (vouchesRaw.isSuccess) {
        const vouches = vouchesRaw.data;
        if ("Vouches-For" in vouches) {
          const historyWhitelisted = Object.entries(vouches["Vouchers"]).filter(
            ([voucher, vouch]) =>
              vouchLookupByAddress.get(voucher) !== undefined &&
              vouch["Vouch-For"] === walletId,
          );
          const score = historyWhitelisted.reduce((acc, [, vouchData]) => {
            const [value] = vouchData.Value.split("-");
            return acc + parseFloat(value);
          }, 0);
          return {
            for: vouches["Vouches-For"],
            score,
            history: historyWhitelisted.reduce(
              (acc, [voucher, vouchData]) => ({
                ...acc,
                [voucher]: vouchData,
              }),
              {},
            ),
          } as GetVouchesProcessed;
        }
        return {
          for: undefined,
          score: 0,
          history: {},
        } as GetVouchesProcessed;
      }
    },
    enabled: vouchesRaw.isSuccess,
    refetchInterval: false,
    retry: false,
  });

  return { ...vouchesRaw, data: vouchesHistory.data };
};
