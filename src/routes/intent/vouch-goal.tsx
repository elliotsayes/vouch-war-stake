import { createFileRoute } from "@tanstack/react-router";
import { useProfileInfo } from "../../features/profile/hooks/useProfileInfo";
import { fetchUrl } from "../../features/arweave/lib/arweave";

type VouchGoalSearch = {
  value: number;
  currency: string;
  profileId?: string;
};

export const Route = createFileRoute("/intent/vouch-goal")({
  validateSearch: (search): VouchGoalSearch => {
    return {
      value: Number(search.value),
      currency: (search.currency as string) || "USD",
      profileId: (search.profileId as string) || undefined,
    };
  },

  component: VouchGoal,
});

function VouchGoal() {
  const {
    currency: targetCurrency,
    value: targetValue,
    profileId,
  } = Route.useSearch();

  const profileInfo = useProfileInfo(profileId ? { profileId } : undefined);

  return (
    <div className="p-2">
      <h1>Vouch Goal</h1>
      <p>
        Target Value: {targetValue} {targetCurrency}
      </p>
      <p>Profile ID: {profileId}</p>
      {profileInfo.isSuccess &&
        (profileInfo.data ? (
          <>
            <p>Profile Name: {profileInfo.data.DisplayName}</p>
            <img
              src={fetchUrl(profileInfo.data.ProfileImage)}
              alt={profileInfo.data.DisplayName}
            />
          </>
        ) : (
          <p>Profile not found</p>
        ))}
    </div>
  );
}
