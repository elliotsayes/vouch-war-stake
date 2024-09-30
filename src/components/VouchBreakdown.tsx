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
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

export const VouchBreakdown = () => {
  const { connected, connect } = useConnection();
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  if ((vouchData.data?.history?.length ?? 0) === 0) {
    return (
      <Card className="px-2 pb-1">
        <div className="text-primary/60 px-1 py-1 w-56 text-sm">
          {connected ? (
            "No vouches found. Use a vouch service to get V Points."
          ) : (
            <>
              <Button
                onClick={connect}
                size={"sm"}
                variant={"outline"}
                className="px-1"
              >
                Connect
              </Button>{" "}
              to see your V Points.
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-2 pb-1">
      <Table>
        {/* <TableCaption className="mt-1">Allowed Vouch methods</TableCaption> */}
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
                <TableRow key={voucherName}>
                  <TableCell className="font-medium">
                    {vouchMeta?.name === "Vouch-wAR-Stake" ? (
                      <span>{vouchMeta?.name}</span>
                    ) : (
                      <a
                        href={vouchMeta?.url}
                        target="_blank"
                        className="underline flex items-center gap-0.5"
                        rel="noreferrer"
                      >
                        {vouchMeta?.name}
                        <ExternalLinkIcon width={12} />
                      </a>
                    )}
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
