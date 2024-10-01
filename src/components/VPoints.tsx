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
        <TooltipTrigger>
          <div className="bg-primary/20 text-primary-foreground text-sm flex flex-row items-center py-0.5 px-1.5 rounded-md drop-shadow-md shadow-black">
            <img
              src="/images/vouch_dao-v2.svg"
              className="w-4 h-4 mr-1 drop-shadow-sm"
            />
            <span className="drop-shadow-sm"> Points</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Vouch Points</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
