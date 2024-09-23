import { fetchUrl } from "@/features/arweave/lib/arweave";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface ProfileImageProps {
  profileImage?: string;
  size?: "small" | "large";
}

export default function ProfileImage({ profileImage }: ProfileImageProps) {
  const hasProfileImage =
    profileImage && profileImage != "" && profileImage != "None";

  return (
    <Avatar className="w-8 h-8">
      {hasProfileImage && (
        <AvatarImage className="w-8 h-8" src={fetchUrl(profileImage)} />
      )}
      <AvatarFallback />
    </Avatar>
  );
}
