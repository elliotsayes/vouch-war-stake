import { whitelistedVouchers } from "@/lib/vouchers";
import {
  CaretDownIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { useActiveAddress } from "arweave-wallet-kit";
import { TriangleAlertIcon } from "lucide-react";

const linkedVouchers = whitelistedVouchers.filter(
  (voucher) => voucher.name != "Vouch-wAR-Stake",
);
const actionVoucher = whitelistedVouchers.find(
  (voucher) => voucher.name === "Vouch-wAR-Stake",
)!;

export interface VouchLinksProps {
  onActionVoucherClick: () => void;
}

export const VouchButtons = ({ onActionVoucherClick }: VouchLinksProps) => {
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId);

  return (
    <TooltipProvider>
      <div className="flex flex-row flex-grow-0 max-w-screen-lg justify-evenly gap-4">
        {linkedVouchers.map((voucher) => {
          const alreadyDone = vouchData.data?.history
            ? Object.entries(vouchData.data.history).find(
                (x) => x[0] === voucher.address,
              )
            : undefined;
          const zeroValue = alreadyDone?.[1].Value.startsWith("0") ?? false;
          return (
            <div className="flex flex-col items-center gap-2 max-w-28">
              <div className="relative">
                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full transition-opacity duration-500 ${alreadyDone ? "opacity-100" : "opacity-0"} ${zeroValue ? "bg-orange-500/10" : "bg-green-500/10"}`}
                >
                  <Tooltip>
                    <TooltipTrigger disabled={!alreadyDone}>
                      {zeroValue ? (
                        <TriangleAlertIcon className="text-orange-400 w-3 h-3 mb-1 mr-0" />
                      ) : (
                        <CheckIcon className="text-green-600 w-4 h-4 mb-1 mr-1" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {zeroValue ? (
                        <>
                          Vouch value
                          <br />
                          is zero
                        </>
                      ) : (
                        <>
                          Vouch method
                          <br />
                          already complete
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {voucher.icon}
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <span>
                    <a
                      href={voucher.url}
                      target="_blank"
                      className="underline items-center pl-2 text-wrap"
                      rel="noreferrer"
                    >
                      {voucher.name.replace(/-/g, " ")}
                    </a>
                    <ExternalLinkIcon className="ml-1 inline" width={12} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-60">
                  {voucher.description}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
        <div className="flex flex-col items-center gap-2 max-w-28">
          <div>{actionVoucher.icon}</div>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <a
                  onClick={onActionVoucherClick}
                  className="cursor-pointer underline items-center pl-2 text-wrap"
                >
                  {actionVoucher.name.replace(/-/g, " ")}
                </a>
                <CaretDownIcon className="inline" width={20} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-60">
              {actionVoucher.description}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
