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

export const VouchBreakdown = () => {
  const { connected } = useConnection();
  const walletId = useActiveAddress();
  const vouchData = useWhitelistedVouchData(walletId!);

  if ((vouchData.data?.history?.length ?? 0) === 0) {
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
    <Card>
      <Table className="px-2 pb-1">
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
          {vouchData.data &&
            vouchData.data.history?.map(([voucherName, vouchData]) => {
              const vouchMeta = vouchLookupByAddress.get(voucherName);
              return (
                <TableRow key={voucherName}>
                  <TableCell className="font-medium text-left">
                    <span>{vouchMeta?.name.split("-").slice(1).join(" ")}</span>
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
