import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileInfo } from "../contract/model";
import ProfileImage from "./ProfileImage";
import { Button } from "@/components/ui/button";
import { useConnection } from "arweave-wallet-kit";

interface ProfileDetailsDropdownProps {
  profileInfo: ProfileInfo;
}

export default function ProfileDetailsDropdown({
  profileInfo,
}: ProfileDetailsDropdownProps) {
  const { disconnect } = useConnection();
  const hasDescription =
    profileInfo.Description && profileInfo.Description != "";

  return (
    <>
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row gap-2">
            <ProfileImage profileImage={profileInfo.ProfileImage} />
            <div className="flex flex-grow flex-col">
              <p className="text-xl font-bold">{profileInfo.DisplayName}</p>
              <p className="text-sm text-gray-500">@{profileInfo.Username}</p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start text-left">
          {hasDescription ? (
            <p className="text-center">{profileInfo.Description}</p>
          ) : (
            <p className="text-center text-gray-500 italic">No bio</p>
          )}
          <Button onClick={disconnect}>Log out</Button>
        </div>
      </CardContent>
    </>
  );
}
