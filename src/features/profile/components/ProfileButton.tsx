import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProfileDetailsDropdown from "./ProfileDetailsDropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileImage from "./ProfileImage";
import { useActiveAddress } from "arweave-wallet-kit";
import { useProfileInfo } from "../hooks/useProfileInfo";

export default function ProfileButton() {
  const walletId = useActiveAddress();
  const profileInfo = useProfileInfo({ walletId });

  return (
    <Popover>
      <PopoverTrigger>
        <ProfileImage
          profileImage={profileInfo.data?.ProfileImage}
          size="small"
        />
      </PopoverTrigger>
      <PopoverContent align="end">
        {profileInfo.data ? (
          <ProfileDetailsDropdown profileInfo={profileInfo.data} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-xl font-bold">No Profile</p>
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Go to{" "}
                <a
                  href="https://ao-bazar.arweave.dev/#/"
                  target="_blank"
                  className="underline"
                >
                  Bazar
                </a>{" "}
                to create your profile
              </p>
            </CardContent>
          </Card>
        )}
      </PopoverContent>
    </Popover>
  );
}
