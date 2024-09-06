import { TestMessage } from "./components/TestMessage";
import "./Home.css";
import { ConnectButton, useConnection } from "arweave-wallet-kit";

export function Home() {
  const { connected } = useConnection();

  return (
    <>
      <div>
        <ConnectButton />
      </div>
      {connected ? <TestMessage /> : <div>Connect to Arweave to continue</div>}
    </>
  );
}
