import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { VouchState } from "./components/VouchState";
import "./Home.css";
import { ConnectButton, useConnection } from "arweave-wallet-kit";

export function Home() {
  const { connected } = useConnection();

  return (
    <>
      <div>
        <ConnectButton />
      </div>
      {connected ? <VouchState /> : <div>Connect to Arweave to continue</div>}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </>
  );
}
