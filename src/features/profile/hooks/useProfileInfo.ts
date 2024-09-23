import { queryOptions, useQuery } from "@tanstack/react-query";
import { profileInfoBatcher, profileInfoBatcherWallet } from "../utils/batch";
import { ProfileInfo } from "../contract/model";

type WalletIdOrProfileId = {
  walletId?: string;
  profileId?: string;
};

export const useProfileInfo = (opts: WalletIdOrProfileId) => {
  const { walletId, profileId } = opts;

  // check if profileId is defined
  let queryOpts = queryOptions({
    queryKey: ["ProfileInfo"],
    queryFn: async () => {
      return undefined as ProfileInfo | undefined;
    },
  });
  if (profileId) {
    queryOpts = queryOptions({
      queryKey: ["ProfileInfo", profileId],
      queryFn: async () => {
        const profileInfo = await profileInfoBatcher.fetch(profileId);
        return profileInfo as ProfileInfo | undefined;
      },
    });
  } else if (walletId) {
    queryOpts = queryOptions({
      queryKey: ["ProfileInfoByWallet", walletId],
      queryFn: async () => {
        const walletIdAndProfileInfo =
          await profileInfoBatcherWallet.fetch(walletId);
        return walletIdAndProfileInfo.profile as ProfileInfo | undefined;
      },
    });
  }

  return useQuery(queryOpts);
};
