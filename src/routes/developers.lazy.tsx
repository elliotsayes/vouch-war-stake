import { AppTitle } from "@/components/AppTitle";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodeIcon } from "@radix-ui/react-icons";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowLeftRight, DotIcon } from "lucide-react";

export const Route = createLazyFileRoute("/developers")({
  component: Developers,
});

function Developers() {
  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen relative items-center justify-center">
        <div className="absolute top-0 left-0 p-2">
          <Tooltip>
            <TooltipTrigger>
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                })}
                to={"/"}
              >
                <ArrowLeftIcon />
              </Link>
            </TooltipTrigger>
            <TooltipContent align="start">Back to home</TooltipContent>
          </Tooltip>
        </div>
        <AppTitle
          title="Developer Guide"
          subtitle={
            <>
              Add{" "}
              <a
                href="https://hackmd.io/@ao-docs/r13cgYWlC"
                target="_blank"
                className="text-muted-foreground/70 underline decoration-dashed decoration-muted-foreground/40"
              >
                Vouch Protocol
              </a>{" "}
              to your App
            </>
          }
        />
        <div className="flex flex-col wrap justify-center mt-4 max-w-screen-md gap-4 p-2">
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2">
              <CodeIcon className="w-8 h-8 opacity-80 m-1" />
              <span className="text-xl text-muted-foreground">
                Scoring a walletʼs Vouch Points
              </span>
            </div>
            <ul className="text-muted-foreground text-md">
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://github.com/elliotsayes/vouch-war-stake/blob/main/process/vouch-scorer.lua"
                  target="_blank"
                  className="underline"
                >
                  AOS Lua Code
                </a>
              </li>
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://github.com/elliotsayes/vouch-war-stake/blob/main/src/lib/vouchScorer.ts"
                  target="_blank"
                  className="underline"
                >
                  Typescript Code
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 opacity-80 m-2" />
              <span className="text-xl text-muted-foreground">
                Integrating with Vouch Portal
              </span>
            </div>
            <span className="text-muted-foreground text-md">
              <p className="mb-1 pl-2">
                Set the search params in this{" "}
                <Link
                  to="/intent/vouch-goal"
                  search={{
                    value: 1,
                    profileId: "",
                    appLink: "",
                  }}
                  className="text-muted-foreground underline"
                >
                  URL
                </Link>{" "}
                and link it from your app
              </p>
              <ul className="text-muted-foreground text-md">
                <li>
                  <DotIcon className="inline mb-1" strokeWidth={4} />
                  <code className="text-xs">value</code> - the required vouch
                  points for your app
                </li>
                <li>
                  <DotIcon className="inline mb-1" strokeWidth={4} />
                  <code className="text-xs">profileId</code> - your app's
                  ao-profile id on{" "}
                  <a
                    href="https://bazar.arweave.dev/"
                    target="_blank"
                    className="underline"
                  >
                    bazar
                  </a>
                </li>
                <li>
                  <DotIcon className="inline mb-1" strokeWidth={4} />
                  <code className="text-xs">appLink</code> - a link to your app
                  homepage
                </li>
              </ul>
            </span>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2">
              <img
                src="./images/github-mark.svg"
                alt="GitHub"
                className="w-6 h-6 opacity-80 m-2"
              />
              <span className="text-xl text-muted-foreground">
                Vouch Portal code
              </span>
            </div>
            <ul className="text-muted-foreground text-md">
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://github.com/elliotsayes/vouch-war-stake"
                  target="_blank"
                  className="underline"
                >
                  Vouch Portal main repo
                </a>
              </li>
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://github.com/elliotsayes/vouch-war-stake/blob/main/process/vouch-custody.lua"
                  target="_blank"
                  className="underline"
                >
                  Vouch-wAR-Stake service source
                </a>
              </li>
            </ul>
          </div>
          {/* <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-2">
              <img
                src="./images/github-mark.svg"
                alt="GitHub"
                className="w-6 h-6 opacity-80 m-2"
              />
              <span className="text-xl text-muted-foreground">
                Vouch contracts
              </span>
            </div>
            <ul className="text-muted-foreground text-md">
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://www.ao.link/#/entity/3y0YE11i21hpP8UY0Z1AVhtPoJD4V_AbEBx-g0j9wRc"
                  target="_blank"
                  className="underline"
                >
                  Staking vouch service contract
                </a>
              </li>
              <li>
                <DotIcon className="inline mb-1" strokeWidth={4} />
                <a
                  href="https://www.ao.link/#/entity/zYBcGWB4KJeB4pc04XiNOKrD0DQBPelvNBbfDnqiunQ"
                  target="_blank"
                  className="underline"
                >
                  Custody contract
                </a>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </TooltipProvider>
  );
}
