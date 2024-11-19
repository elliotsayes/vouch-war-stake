import { Button } from "./ui/button";
import { useConnection } from "arweave-wallet-kit";
import { VPoints } from "./VPoints";

export const ConnectText = () => {
  const { connect } = useConnection();

  return (
    <div className="mt-1 flex flex-row items-center gap-1">
      <Button
        onClick={connect}
        size={"sm"}
        variant={"outline"}
        className="px-1"
      >
        Connect
      </Button>{" "}
      to see your <VPoints noTooltip={true} />
    </div>
  );
};
