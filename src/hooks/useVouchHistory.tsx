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
          const history = Object.entries(vouchesRaw.data["Vouchers"]).filter(
            ([voucher]) => vouchLookupByAddress.get(voucher) !== undefined,
          );
          const total = history.reduce((acc, [, vouchData]) => {
            const [value] = vouchData.Value.split("-");
            return acc + parseFloat(value);
          }, 0);
          return {
            for: vouchesRaw.data["Vouches-For"],
            total: total,
            history: history,
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
