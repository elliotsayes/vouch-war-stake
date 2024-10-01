import { fetchUrl } from "@/features/arweave/lib/arweave";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VouchGoalSearch } from "./intent/vouch-goal";

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
      value: 4.2,
      currency: "USD",
      profileId: "QszM8HySK5XGw-tTLNVnG7WOIBIHJ_Mnth7Pa22I_iw",
      appLink: "https://dumdum.arweave.net/",
    },
  },
];

function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col h-screen relative items-center justify-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center px-4 mb-4">
        Vouch to access your
        <br />
        favorite Permaweb Apps!
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        {profiles.map((profile, index) => (
          <Link
            key={profile.name}
            to="/intent/vouch-goal"
            search={profile.search}
            className={`flex flex-col items-center opacity-0 translate-y-5 transition-all duration-500 ease-in-out ${
              mounted ? "opacity-100 translate-y-0" : ""
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-2 hover:animate-pulse transition-transform duration-300 ease-in-out hover:scale-110 group">
              <img
                src={fetchUrl(profile.imageTxId)}
                alt={profile.name}
                className="animate-reveal object-cover fill"
              />
            </div>
            <p className="text-lg font-semibold transition-all duration-300 ease-in-out group-hover:translate-y-1 group-hover:text-gray-600">
              {profile.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
