import { ArweaveWalletKit } from "arweave-wallet-kit";
import { Home } from "./Home";

export function App() {
  return (
    <ArweaveWalletKit>
      <Home />
    </ArweaveWalletKit>
  );
}
