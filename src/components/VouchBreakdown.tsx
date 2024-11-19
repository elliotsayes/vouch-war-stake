import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWhitelistedVouchData } from "@/hooks/useVouchHistory";
import { vouchLookupByAddress } from "@/lib/vouchers";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { VPoints } from "./VPoints";
import { ConnectText } from "./ConnectText";
import { useMemo } from "react";

const showCount = 6;

export const VouchBreakdown = () => {
  const { connected } = useConnection();
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  const vouchHistorySorted = useMemo(() => {
    if (!vouchData.data?.history) return undefined;
    return Object.entries(vouchData.data!.history).sort(
      ([, a], [, b]) =>
        parseFloat(b.Value.split("-")[0]) - parseFloat(a.Value.split("-")[0]),
    );
  }, [vouchData.data]);
  const additionalVouches = Math.max(
    0,
    (vouchHistorySorted?.length ?? 0) - showCount,
  );

  if ((Object.keys(vouchData.data?.history ?? {}).length ?? 0) === 0) {
    return (
      <Card className="px-2 pb-1">
        <div className="text-primary/60 px-1 py-1 w-56 text-sm">
          {connected ? (
            <>
              <span>
                No vouches found, use a vouch service to earn <VPoints />
              </span>
              <Button
                variant="outline"
                size={"icon"}
                className="ml-2"
                onClick={() => vouchData.refetch()}
                disabled={vouchData.isFetching}
              >
                <ReloadIcon
                  className={`${vouchData.isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </>
          ) : (
            <ConnectText />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="py-0.5">
      <Table className="">
        {/* <TableCaption className="mt-1">Allowed Vouch methods</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Method</TableHead>
            <TableHead className="text-right">
              Value
              <Button
                variant="outline"
                size={"icon"}
                className="ml-1 p-0"
                onClick={() => vouchData.refetch()}
                disabled={vouchData.isFetching}
              >
                <ReloadIcon
                  className={`${vouchData.isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchHistorySorted && (
            <>
              {vouchHistorySorted
                .slice(0, showCount)
                .map(([voucherAddress, vouchData]) => {
                  const vouchMeta = vouchLookupByAddress.get(voucherAddress);

                  const voucherName = vouchMeta?.name
                    .split("-")
                    .slice(1)
                    .join(" ");
                  const vouchValue = parseFloat(vouchData.Value.split("-")[0]);

                  return (
                    <TableRow key={voucherAddress}>
                      <TableCell className="font-medium text-left text-primary/80">
                        <span>
                          {voucherName ?? `${voucherAddress.slice(0, 4)}...`}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums text-sm ${vouchValue < 0.01 ? "text-primary/60" : ""}`}
                      >
                        {vouchValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {additionalVouches > 0 && (
                <TableRow>
                  <TableCell className="text-primary/60 text-left pl-2">
                    <span>...plus {additionalVouches} more</span>
                  </TableCell>
                  <TableCell className="text-right text-primary/60">
                    <span></span>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
