import { vouchDaoVouchesQuery } from "@/contract/vouchDao";
import { vouchLookupByAddress } from "@/lib/vouchers";
import { useQuery } from "@tanstack/react-query";

export const useWhitelistedVouchData = (walletId?: string) => {
  const vouchesRaw = useQuery(vouchDaoVouchesQuery(walletId));

  const vouchesHistory = useQuery({
    queryKey: ["vouchesHistory", vouchesRaw.data],
    queryFn: async () => {
      if (vouchesRaw.isSuccess) {
        if ("Vouches-For" in vouchesRaw.data) {
          const historyWhitelisted = Object.entries(
            vouchesRaw.data["Vouchers"],
          ).filter(
            ([voucher, vouch]) =>
              vouchLookupByAddress.get(voucher) !== undefined &&
              vouch["Vouch-For"] === walletId,
          );
          const total = historyWhitelisted.reduce((acc, [, vouchData]) => {
            const [value] = vouchData.Value.split("-");
            return acc + parseFloat(value);
          }, 0);
          return {
            for: vouchesRaw.data["Vouches-For"],
            total: total,
            history: historyWhitelisted,
          };
        }
      }
      return {
        for: undefined,
        total: 0,
        history: [],
      };
    },
    enabled: vouchesRaw.isSuccess,
    refetchInterval: false,
    retry: false,
  });

  return { ...vouchesRaw, data: vouchesHistory.data };
};
