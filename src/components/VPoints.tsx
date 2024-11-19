import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";

export const VPoints = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-help">
          <div className="bg-primary/20 text-primary-foreground text-sm flex flex-row items-center py-1 px-1.5 rounded-md drop-shadow-md shadow-black">
            <img
              src="/images/vouch_dao-v2.svg"
              className="w-4 h-4 mr-1 drop-shadow-sm"
            />
            <span className="text-xs font-semibold drop-shadow-sm">
              {" "}
              Points
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Your <b>Vouch Points</b> prove your credibility
          <br />
          across all participating permaweb apps
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
