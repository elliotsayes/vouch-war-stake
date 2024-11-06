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
import { ArrowLeftIcon } from "lucide-react";

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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center px-4 mb-4">
          Developer Guide
        </h1>
        <div className="flex flex-col wrap justify-center gap-4 mt-8">
          <a
            href="https://github.com/elliotsayes/vouch-war-stake/blob/main/process/vouch-scorer.lua"
            target="_blank"
            className="flex gap-4 items-center"
          >
            <CodeIcon className="w-8 h-8 opacity-80" />
            <span className="text-muted-foreground text-lg">
              Scoring Lua Code
            </span>
          </a>
          <a
            href="https://github.com/elliotsayes/vouch-war-stake"
            target="_blank"
            className="flex gap-4 items-center"
          >
            <img
              src="./public/images/github-mark.svg"
              alt="GitHub"
              className="w-8 h-8 opacity-80"
            />
            <span className="text-muted-foreground text-lg">
              Portal Website Code
            </span>
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}
