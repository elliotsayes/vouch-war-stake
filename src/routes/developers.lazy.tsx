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
import { ArrowLeftIcon, ArrowLeftRight } from "lucide-react";

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
        <h1 className="text-5xl md:text-6xl font-bold">Developer Guide</h1>
        <h2 className="text-xl md:text-2xl text-muted-foreground pt-1">
          Add{" "}
          <a
            href="https://hackmd.io/@ao-docs/r13cgYWlC"
            target="_blank"
            className="underline text-muted-foreground/80"
          >
            Vouch Protocol
          </a>{" "}
          to your App
        </h2>
        <div className="flex flex-col wrap justify-center mt-8 max-w-screen-md">
          <span className="flex gap-4 items-center">
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <ArrowLeftRight className="w-8 h-8 opacity-80 my-4" />
              </TooltipTrigger>
              <TooltipContent>Integrate your app</TooltipContent>
            </Tooltip>
            <span className="text-muted-foreground text-lg">
              Set the search params in this <br />
              <Link
                to="/intent/vouch-goal"
                search={{
                  currency: "USD",
                  value: 1,
                  profileId: "",
                  appLink: "",
                }}
                className="text-muted-foreground font-semibold"
              >
                URL
              </Link>{" "}
              and link it from your app
            </span>
          </span>
          <a
            href="https://github.com/elliotsayes/vouch-war-stake/blob/main/process/vouch-scorer.lua"
            target="_blank"
            className="flex gap-4 items-center"
          >
            <CodeIcon className="w-8 h-8 opacity-80 my-4" />
            <span className="text-muted-foreground text-lg font-semibold">
              Scoring Lua Code
            </span>
          </a>
          <a
            href="https://github.com/elliotsayes/vouch-war-stake"
            target="_blank"
            className="flex gap-4 items-center"
          >
            <img
              src="./images/github-mark.svg"
              alt="GitHub"
              className="w-8 h-8 opacity-80 my-4"
            />
            <span className="text-muted-foreground text-lg font-semibold">
              Portal Website Code
            </span>
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}
