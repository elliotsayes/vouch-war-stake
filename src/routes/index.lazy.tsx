import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUrl } from "@/features/arweave/lib/arweave";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col h-screen relative items-center justify-center">
      <h1 className="text-2xl sm:text-4xl font-bold text-center px-4 mb-4">
        Vouch to access your
        <br />
        favorite Permaweb Apps!
      </h1>
      <div className="flex flex-row justify-center text-center gap-8 flex-wrap">
        <Link
          to="/intent/vouch-goal"
          search={{
            value: 10,
            currency: "USD",
            profileId: "QIi6XZQOJlCnT_Vf-xKdcYqrBk-Y94QT8eiuBDLsMq8",
          }}
        >
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={fetchUrl("7Sp4jk77OrK8qxdVe8RissGbp0-0w32vhR0SuPGSlPU")}
            />
            <AvatarFallback className="animate-pulse" />
          </Avatar>
          <h1>Llama Land</h1>
        </Link>
        <Link
          to="/intent/vouch-goal"
          search={{
            value: 10,
            currency: "USD",
            profileId: "QszM8HySK5XGw-tTLNVnG7WOIBIHJ_Mnth7Pa22I_iw",
          }}
        >
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={fetchUrl("NNkDHUrCOnMAP7xh90K_-I41FpMugdnayTytA5VYmdM")}
            />
            <AvatarFallback className="animate-pulse" />
          </Avatar>
          <h1>Permaverse</h1>
        </Link>
      </div>
    </div>
  );
}
