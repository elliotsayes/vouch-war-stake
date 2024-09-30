import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUrl } from "@/features/arweave/lib/arweave";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const image = "7Sp4jk77OrK8qxdVe8RissGbp0-0w32vhR0SuPGSlPU";

  return (
    <div className="flex flex-col h-screen relative items-center justify-center">
      <h1 className="text-2xl sm:text-4xl font-bold text-center px-4 mb-4">
        Vouch to access your
        <br />
        favorite Permaweb Apps!
      </h1>
      <Link
        to="/intent/vouch-goal"
        search={{
          value: 10,
          currency: "USD",
          profileId: "QIi6XZQOJlCnT_Vf-xKdcYqrBk-Y94QT8eiuBDLsMq8",
        }}
      >
        <Avatar className="w-24 h-24">
          <AvatarImage src={fetchUrl(image)} />
          <AvatarFallback className="animate-pulse" />
        </Avatar>
      </Link>
    </div>
  );
}
