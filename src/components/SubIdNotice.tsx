import { Card } from "./ui/card";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { Button } from "./ui/button";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { vouchDaoPromote, vouchDaoVouchesQuery } from "@/contract/vouchDao";
import useAoSigner from "@/hooks/useAoSigner";
import { toast } from "sonner";

interface SubIdNoticeProps {
  mainAddress: string;
}

export const SubIdNotice = ({ mainAddress }: SubIdNoticeProps) => {
  const { connected, connect } = useConnection();
  const walletId = useActiveAddress();
  const { aoSigner } = useAoSigner();

  const vouchesRaw = useQuery(vouchDaoVouchesQuery(walletId));

  const promote = useMutation({
    mutationKey: ["promote", walletId],
    mutationFn: () => vouchDaoPromote(aoSigner!),
    onSuccess: () => {
      toast("Promoted wallet!");
      vouchesRaw.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card className="px-2 pb-1">
      <div className="text-primary/60 px-1 py-1 w-56 text-sm text-left">
        {connected ? (
          <>
            <span>
              Your wallet is a registered as a Sub-ID for{" "}
              <span className="font-mono text-xs break-all">{mainAddress}</span>
              .<br />
            </span>
            <Button
              variant="outline"
              size={"sm"}
              className="mt-1 mx-2"
              disabled={promote.isPending || vouchesRaw.isRefetching}
              onClick={() => promote.mutate()}
            >
              Promote
              <ChevronUpIcon
                className={`ml-1 ${promote.isPending || vouchesRaw.isRefetching ? "animate-spin" : ""}`}
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
};
