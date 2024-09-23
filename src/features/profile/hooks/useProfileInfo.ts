import { queryOptions, useQuery } from "@tanstack/react-query";
import { profileInfoBatcher, profileInfoBatcherWallet } from "../utils/batch";
import { ProfileInfo } from "../contract/model";

type WalletIdOrProfileId =
  | {
      walletId: string;
    }
  | {
      profileId: string;
    };

export const useProfileInfo = (opts: WalletIdOrProfileId | undefined) => {
  // check if profileId is defined
  let queryOpts = queryOptions({
    queryKey: ["ProfileInfo"],
    queryFn: async () => {
      return undefined as ProfileInfo | undefined;
    },
  });
  if ("profileId" in opts) {
    queryOpts = queryOptions({
      queryKey: ["ProfileInfo", opts.profileId],
      queryFn: async () => {
        const profileInfo = await profileInfoBatcher.fetch(opts.profileId);
        return profileInfo as ProfileInfo | undefined;
      },
    });
  } else if ("walletId" in opts) {
    queryOpts = queryOptions({
      queryKey: ["ProfileInfoByWallet", opts.walletId],
      queryFn: async () => {
        const walletIdAndProfileInfo = await profileInfoBatcherWallet.fetch(
          opts.walletId,
        );
        return walletIdAndProfileInfo.profile as ProfileInfo | undefined;
      },
    });
  }

  return useQuery(queryOpts);
};
