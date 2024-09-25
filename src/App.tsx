import { ArweaveWalletKit } from "arweave-wallet-kit";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ArweaveWalletKit
        config={{
          permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "SIGNATURE"],
        }}
        theme={{
          displayTheme: "light",
          accent: {
            r: 128,
            g: 128,
            b: 128,
          },
          titleHighlight: {
            r: 128,
            g: 128,
            b: 128,
          },
          font: {
            fontFamily: "Inter",
          },
        }}
      >
        <RouterProvider router={router} />
      </ArweaveWalletKit>
    </QueryClientProvider>
  );
}
