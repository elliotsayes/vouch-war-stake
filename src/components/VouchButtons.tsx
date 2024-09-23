import { whitelistedVouchers } from "@/lib/vouchers";
import { CaretDownIcon, ExternalLinkIcon } from "@radix-ui/react-icons";

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
  return (
    <div className="flex flex-row flex-grow-0 max-w-screen-lg justify-evenly gap-4">
      {linkedVouchers.map((voucher) => (
        <div className="flex flex-col items-center gap-2 max-w-28">
          <div>{voucher.icon}</div>
          <span>
            <a
              href={voucher.url}
              target="_blank"
              className="underline items-center pl-2 text-wrap"
            >
              {voucher.name}
            </a>
            <ExternalLinkIcon className="ml-1 inline" width={12} />
          </span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-2 max-w-28">
        <div>{actionVoucher.icon}</div>
        <span>
          <a
            onClick={onActionVoucherClick}
            className="cursor-pointer underline items-center pl-2 text-wrap"
          >
            {actionVoucher.name}
          </a>
          <CaretDownIcon className="ml-1 inline" width={16} />
        </span>
      </div>
    </div>
  );
};
