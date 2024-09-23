import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { vouchLookupByAddress } from "@/lib/vouchers";
import { useActiveAddress } from "arweave-wallet-kit";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export const VouchBreakdown = () => {
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  return (
    <Card>
      <Table>
        <TableCaption>Allowed Vouch methods</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchData.isSuccess &&
            vouchData.data.history?.map(([voucherName, vouchData]) => {
              const vouchMeta = vouchLookupByAddress.get(voucherName);
              return (
                <TableRow>
                  <TableCell className="font-medium">
                    <a
                      href={vouchMeta?.url}
                      target="_blank"
                      className="underline flex items-center gap-0.5"
                    >
                      {vouchMeta?.name}
                      <ExternalLinkIcon width={12} />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    {vouchData.Value}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
};
