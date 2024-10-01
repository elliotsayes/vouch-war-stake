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
import { ExternalLinkIcon, ReloadIcon } from "@radix-ui/react-icons";
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
            <>
              <span>
                No vouches found, use a vouch service to earn V Points
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
    <Card>
      <Table className="px-2 pb-1">
        {/* <TableCaption className="mt-1">Allowed Vouch methods</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead className="text-right">
              <Button
                variant="outline"
                size={"icon"}
                className="mr-1"
                onClick={() => vouchData.refetch()}
                disabled={vouchData.isFetching}
              >
                <ReloadIcon
                  className={`${vouchData.isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              Value
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchData.data &&
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
