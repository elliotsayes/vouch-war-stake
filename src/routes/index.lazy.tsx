import { fetchUrl } from "@/features/arweave/lib/arweave";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VouchGoalSearch } from "./intent/vouch-goal";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VPoints } from "@/components/VPoints";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

type Profile = {
  name: string;
  imageTxId: string;
  search: VouchGoalSearch;
};

const profiles: Array<Profile> = [
  {
    name: "Llama Land",
    imageTxId: "7Sp4jk77OrK8qxdVe8RissGbp0-0w32vhR0SuPGSlPU",
    search: {
      value: 5,
      currency: "USD",
      profileId: "QIi6XZQOJlCnT_Vf-xKdcYqrBk-Y94QT8eiuBDLsMq8",
      appLink: "https://llamaland.arweave.net/",
    },
  },
  {
    name: "Permaverse",
    imageTxId: "NNkDHUrCOnMAP7xh90K_-I41FpMugdnayTytA5VYmdM",
    search: {
      value: 5,
      currency: "USD",
      profileId: "QszM8HySK5XGw-tTLNVnG7WOIBIHJ_Mnth7Pa22I_iw",
      appLink: "https://dumdum.arweave.net/",
    },
  },
  {
    name: "Bazar",
    imageTxId: "2btiARcMnhkdy5H-OK_T0dd-Zf-ga9Shm2ttV699Zjg",
    search: {
      value: 2,
      currency: "USD",
      profileId: "CUITkl8BV4xJX_ylXtf6oG7cGDpJ_4CPCbS5rz-20I4",
      appLink: "https://bazar.arweave.net/",
    },
  },
];

function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen relative items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold">Vouch Portal</h1>
        <h2 className="text-xl md:text-2xl text-muted-foreground">
          Your Passport to the Permaweb
        </h2>
        <div className="flex flex-col items-center">
          <Button
            variant={"default"}
            size={"lg"}
            className="my-4 px-4 py-4 md:px-6 md:py-6 bg-orange-600/80 hover:bg-orange-600 text-lg md:text-xl"
            asChild
          >
            <Link to="/intent/vouch-status">Get Vouched!</Link>
          </Button>
          <p className="my-2 px-8">
            Earn <VPoints noTooltip={true} /> to prove your credibility
            <br />
            across your favorite permaweb apps
          </p>
          <div className="flex flex-wrap justify-center gap-4 px-8">
            {profiles.map((profile) => (
              <Link
                key={profile.name}
                to="/intent/vouch-goal"
                search={profile.search}
                className={`flex flex-col items-center opacity-0 translate-y-5 transition-all duration-500 ease-in-out ${
                  mounted ? "opacity-100 translate-y-0" : ""
                }`}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 hover:animate-pulse transition-transform duration-300 ease-in-out hover:scale-110 group">
                  <img
                    src={fetchUrl(profile.imageTxId)}
                    alt={profile.name}
                    className="animate-reveal object-cover fill"
                  />
                </div>
                <p className="text-md font-semibold transition-all duration-300 ease-in-out group-hover:translate-y-1 group-hover:text-gray-600">
                  {profile.name}
                </p>
              </Link>
            ))}
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <div
                  key={"more"}
                  className={`flex flex-col items-center opacity-0 translate-y-5 transition-all duration-500 ease-in-out ${
                    mounted ? "opacity-100 translate-y-0" : ""
                  }`}
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 hover:animate-pulse transition-transform duration-300 ease-in-out hover:scale-110 group flex flex-col items-center justify-evenly bg-gray-50">
                    <div />
                    <DotsHorizontalIcon className="w-3/5 h-3/5 animate-reveal object-cover fill text-gray-700" />
                  </div>
                  <p className="text-md font-semibold transition-all duration-300 ease-in-out group-hover:translate-y-1 group-hover:text-gray-600">
                    and more...
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={20}
                className="text-center"
              >
                Watch this space for
                <br />a live index 👀
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="absolute mx-auto bottom-4 sm:text-lg font-mono text-muted-foreground">
          <Link to="/developers">&lt;developers/&gt;</Link>
        </div>
      </div>
    </TooltipProvider>
  );
}
