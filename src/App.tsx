import { ArweaveWalletKit } from "arweave-wallet-kit";
import { Home } from "./Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ArweaveWalletKit>
        <Home />
      </ArweaveWalletKit>
    </QueryClientProvider>
  );
}
