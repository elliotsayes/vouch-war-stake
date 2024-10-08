import { useState, useEffect } from "react";
import { createDataItemSigner } from "@permaweb/aoconnect";
import { useApi } from "arweave-wallet-kit";
import { DataItem } from "warp-arbundles";

type Signer = {
  signDataItem: (dataItem: DataItem) => Promise<ArrayBuffer>;
};

export type AoSigner = ReturnType<typeof createDataItemSigner>;

export function useAoSigner() {
  const api = useApi();

  const [aoSigner, setAoSigner] = useState<AoSigner | null>(null);

  useEffect(() => {
    if (!api) return;

    // type inference of api as BrowserWalletStrategy
    setAoSigner(() => createDataItemSigner(api as Signer));

    return () => {
      setAoSigner(null);
    };
  }, [api]);

  return { aoSigner };
}

export default useAoSigner;
